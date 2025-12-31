// src/features/model-management/hooks/useModelManager.ts
import { useState, useEffect } from "react";
import { webLLMManager } from "../lib/webllm-manager";
import { detectSystemCapabilities, SystemCapabilities } from "../lib/gpu-detector";

interface StorageData {
  currentModelId?: string;
  modelEnabled?: boolean;
}

export const useModelManager = () => {
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<SystemCapabilities | null>(null);
console.log('capabilities', capabilities)

  useEffect(() => {
    // Detect system capabilities
    detectSystemCapabilities().then((caps) => {
      setCapabilities(caps);
    });

    // Load saved state from storage
    chrome.storage.local.get(["currentModelId", "modelEnabled"], (result: StorageData) => {
      if (result.currentModelId) {
        setCurrentModelId(result.currentModelId);
      }
      if (typeof result.modelEnabled === "boolean") {
        setIsEnabled(result.modelEnabled);
      }
    });

    // Set up callbacks
    webLLMManager.setCallbacks({
      onProgress: (progress, message) => {
        setLoadingProgress(progress);
        console.log(message);
      },
      onModelLoaded: (modelId) => {
        setCurrentModelId(modelId);
        setIsLoading(false);
        setIsEnabled(true);
        setError(null);
      },
      onError: (err) => {
        setError(err.message);
        setIsLoading(false);
      },
    });
  }, []);

  const loadModel = async (modelId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await webLLMManager.loadModel(modelId);
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  const toggleEnabled = async () => {
    if (!currentModelId && !isEnabled) {
      setError("Please select and install a model first");
      return;
    }

    setError(null);
    try {
      await webLLMManager.toggleEnabled();
      setIsEnabled(!isEnabled);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return {
    currentModelId,
    isLoading,
    loadingProgress,
    isEnabled,
    error,
    capabilities,
    loadModel,
    toggleEnabled,
  };
};