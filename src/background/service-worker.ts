// src/background/service-worker.ts
import { webLLMManager } from "../features/model-management/lib/webllm-manager";

console.log("Background service worker loaded");

interface StorageData {
  currentModelId?: string;
  modelEnabled?: boolean;
}

// Initialize WebLLM manager in background
webLLMManager.setCallbacks({
  onProgress: (progress, message) => {
    console.log(`[Background] Model loading: ${progress.toFixed(0)}% - ${message}`);
    
    // Broadcast progress to all open popups/tabs
    chrome.runtime.sendMessage({
      type: "MODEL_LOADING_PROGRESS",
      progress,
      message,
    }).catch(() => {
      // Ignore errors if no popup is open
    });
  },
  onModelLoaded: (modelId) => {
    console.log(`[Background] Model loaded: ${modelId}`);
    
    // Notify all open popups
    chrome.runtime.sendMessage({
      type: "MODEL_LOADED",
      modelId,
    }).catch(() => {
      // Ignore errors if no popup is open
    });
  },
  onError: (error) => {
    console.error("[Background] Model error:", error);
    
    // Notify all open popups
    chrome.runtime.sendMessage({
      type: "MODEL_ERROR",
      error: error.message,
    }).catch(() => {
      // Ignore errors if no popup is open
    });
  },
});

// Load saved model on startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Extension installed/updated");
  
  // Try to restore model state
  const result = await chrome.storage.local.get(["currentModelId", "modelEnabled"]) as StorageData;
  if (result.currentModelId && result.modelEnabled) {
    console.log("Restoring model:", result.currentModelId);
    try {
      await webLLMManager.loadModel(result.currentModelId);
    } catch (error) {
      console.error("Failed to restore model:", error);
    }
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("[Background] Received message:", message);
  
  if (message.type === "LOAD_MODEL") {
    webLLMManager.loadModel(message.modelId)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
  
  if (message.type === "TOGGLE_MODEL") {
    webLLMManager.toggleEnabled()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.type === "GET_MODEL_STATE") {
    const state = webLLMManager.getState();
    sendResponse({ success: true, state });
    return true;
  }
  
  return false;
});