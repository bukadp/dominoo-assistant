// src/features/model-management/lib/webllm-manager.ts
import * as webllm from "@mlc-ai/web-llm";
import { MODEL_CONFIGS } from "./model-configs";

export interface WebLLMState {
  engine: webllm.MLCEngine | null;
  currentModelId: string | null;
  isLoading: boolean;
  loadingProgress: number;
  isEnabled: boolean;
}

interface WebLLMCallbacks {
  onProgress?: (progress: number, message: string) => void;
  onModelLoaded?: (modelId: string) => void;
  onError?: (error: Error) => void;
}

interface StorageData {
  currentModelId?: string;
  modelEnabled?: boolean;
}

class WebLLMManager {
  private state: WebLLMState = {
    engine: null,
    currentModelId: null,
    isLoading: false,
    loadingProgress: 0,
    isEnabled: false,
  };

  private callbacks: WebLLMCallbacks = {};

  setCallbacks(callbacks: WebLLMCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  getState(): Readonly<WebLLMState> {
    return { ...this.state };
  }

  async loadModel(modelId: string): Promise<void> {
    const config = MODEL_CONFIGS[modelId];
    if (!config) {
      throw new Error(`Unknown model: ${modelId}`);
    }

    // If same model is already loaded, just enable it
    if (this.state.currentModelId === modelId && this.state.engine) {
      console.log("Model already loaded, enabling it:", modelId);
      this.state.isEnabled = true;
      await chrome.storage.local.set({ modelEnabled: true });
      this.callbacks.onModelLoaded?.(modelId);
      return;
    }

    this.state.isLoading = true;
    this.state.loadingProgress = 0;

    try {
      // Unload previous model if exists
      if (this.state.engine) {
        console.log("Unloading previous model...");
        await this.state.engine.unload();
        this.state.engine = null;
      }

      console.log("Loading model:", config.name);

      // Create engine with progress callback
      this.state.engine = await webllm.CreateMLCEngine(config.modelId, {
        initProgressCallback: (progress) => {
          this.state.loadingProgress = progress.progress * 100;
          this.callbacks.onProgress?.(
            this.state.loadingProgress,
            progress.text || `Loading ${config.name}...`
          );
        },
      });

      this.state.currentModelId = modelId;
      this.state.isLoading = false;
      this.state.isEnabled = true;

      // Save to storage
      await chrome.storage.local.set({
        currentModelId: modelId,
        modelEnabled: true,
      });

      this.callbacks.onModelLoaded?.(modelId);
      console.log("Model loaded successfully:", config.name);
    } catch (error) {
      this.state.isLoading = false;
      this.state.isEnabled = false;
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  async unloadModel(): Promise<void> {
    if (this.state.engine) {
      console.log("Unloading model...");
      try {
        await this.state.engine.unload();
        this.state.engine = null;
        this.state.currentModelId = null;
        this.state.isEnabled = false;

        await chrome.storage.local.set({
          currentModelId: null,
          modelEnabled: false,
        });

        console.log("Model unloaded successfully");
      } catch (error) {
        console.error("Error unloading model:", error);
        throw error;
      }
    }
  }

  async toggleEnabled(): Promise<void> {
    console.log("Toggle enabled called. Current state:", {
      isEnabled: this.state.isEnabled,
      currentModelId: this.state.currentModelId,
      hasEngine: !!this.state.engine
    });

    if (this.state.isEnabled) {
      // Disable: just mark as disabled, don't unload
      console.log("Disabling model (keeping in memory)");
      this.state.isEnabled = false;
      await chrome.storage.local.set({ modelEnabled: false });
    } else {
      // Enable: load model if not loaded, or just enable
      if (!this.state.currentModelId) {
        // No model selected at all
        const result = await chrome.storage.local.get(["currentModelId"]) as StorageData;
        if (result.currentModelId) {
          await this.loadModel(result.currentModelId);
        } else {
          throw new Error("No model selected. Please select a model first.");
        }
      } else if (!this.state.engine) {
        // Model selected but not loaded
        console.log("Loading model:", this.state.currentModelId);
        await this.loadModel(this.state.currentModelId);
      } else {
        // Model already loaded, just enable
        console.log("Model already loaded, enabling");
        this.state.isEnabled = true;
        await chrome.storage.local.set({ modelEnabled: true });
      }
    }
  }

  async chat(userMessage: string): Promise<string> {
    if (!this.state.engine || !this.state.isEnabled) {
      throw new Error("Model not loaded or disabled");
    }

    try {
      const response = await this.state.engine.chat.completions.create({
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  }

  isModelLoaded(): boolean {
    return this.state.engine !== null && this.state.currentModelId !== null;
  }

  isModelEnabled(): boolean {
    return this.state.isEnabled;
  }
}

export const webLLMManager = new WebLLMManager();