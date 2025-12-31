// src/features/model-management/lib/gpu-detector.ts

export interface SystemCapabilities {
  estimatedVRAM: number;
  gpuTier: "low" | "medium" | "high";
  recommendedModelId: string;
  canRunModels: string[];
  gpuInfo?: string;
  detectionMethod?: string; // For debugging
}

interface NavigatorGPU {
  gpu?: {
    requestAdapter: () => Promise<GPUAdapter | null>;
  };
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number; // Returns GB of device RAM
}

interface GPUAdapter {
  limits: {
    maxBufferSize?: number;
    maxStorageBufferBindingSize?: number;
    maxUniformBufferBindingSize?: number;
  };
  info?: {
    vendor?: string;
    device?: string;
    description?: string;
    architecture?: string;
  };
  requestAdapterInfo?: () => Promise<{
    vendor?: string;
    device?: string;
    description?: string;
    architecture?: string;
  }>;
}

/**
 * Calculate VRAM estimate based on multiple factors
 */
function calculateVRAMEstimate(params: {
  maxBufferSize?: number;
  deviceMemory?: number;
  vendor?: string;
  architecture?: string;
}): { vram: number; method: string } {
  const { maxBufferSize, deviceMemory, vendor, architecture } = params;
  
  const estimates: Array<{ vram: number; confidence: number; method: string }> = [];

  // Method 1: Device Memory (navigator.deviceMemory)
  if (deviceMemory) {
    if (vendor?.includes("apple") || architecture?.includes("metal")) {
      // Apple Silicon: unified memory architecture
      // M2 with 8GB RAM: realistically 5-6GB available for heavy ML tasks
      // Be more conservative for 8GB systems
      let vram: number;
      if (deviceMemory <= 8) {
        vram = Math.min(6, deviceMemory * 0.65); // 65% for 8GB systems
      } else {
        vram = Math.min(16, deviceMemory * 0.7); // 70% for 16GB+ systems
      }
      estimates.push({ vram, confidence: 10, method: "deviceMemory (Apple unified)" });
    } else if (vendor?.includes("intel")) {
      const vram = Math.min(8, deviceMemory * 0.35);
      estimates.push({ vram, confidence: 7, method: "deviceMemory (Intel integrated)" });
    } else {
      const vram = Math.min(12, deviceMemory * 0.25);
      estimates.push({ vram, confidence: 5, method: "deviceMemory (discrete estimate)" });
    }
  }

  // Method 2: maxBufferSize
  if (maxBufferSize) {
    const bufferGB = maxBufferSize / (1024 * 1024 * 1024);
    
    if (vendor?.includes("apple") || architecture?.includes("metal")) {
      // For Apple: maxBufferSize is typically 4GB (soft limit)
      // Real usable memory is higher, but be conservative
      const vram = Math.min(12, bufferGB * 1.5); // More conservative multiplier
      estimates.push({ vram, confidence: 5, method: "maxBufferSize (Apple adjusted)" });
    } else {
      const vram = Math.min(16, bufferGB);
      estimates.push({ vram, confidence: 8, method: "maxBufferSize (direct)" });
    }
  }

  // Method 3: Architecture-based heuristics (lower confidence, used as fallback)
  if (architecture) {
    const arch = architecture.toLowerCase();
    
    // Note: Browser reports metal-3 for both M2 and M3
    // Can't reliably distinguish, so use conservative estimate
    if (arch.includes("metal-3") || arch.includes("metal-2")) {
      // M2/M3 series: depends on system RAM
      if (deviceMemory && deviceMemory <= 8) {
        estimates.push({ vram: 5, confidence: 4, method: "architecture (Metal 8GB)" });
      } else {
        estimates.push({ vram: 7, confidence: 4, method: "architecture (Metal 16GB+)" });
      }
    } else if (arch.includes("metal")) {
      estimates.push({ vram: 4, confidence: 3, method: "architecture (Metal legacy)" });
    }
  }

  // Method 4: Vendor-based heuristics (lowest confidence)
  if (vendor && !vendor.includes("apple")) {
    const v = vendor.toLowerCase();
    
    if (v.includes("nvidia")) {
      estimates.push({ vram: 6, confidence: 3, method: "vendor (NVIDIA default)" });
    } else if (v.includes("amd")) {
      estimates.push({ vram: 6, confidence: 3, method: "vendor (AMD default)" });
    } else if (v.includes("intel")) {
      estimates.push({ vram: 4, confidence: 4, method: "vendor (Intel default)" });
    }
  }

  // Fallback
  if (estimates.length === 0) {
    estimates.push({ vram: 4, confidence: 2, method: "fallback (no data)" });
  }

  // Sort by confidence and calculate weighted average
  estimates.sort((a, b) => b.confidence - a.confidence);
  
  // Take top estimates (higher confidence = more weight)
  const topEstimates = estimates.slice(0, 2); // Only top 2 for more accurate results
  const totalConfidence = topEstimates.reduce((sum, e) => sum + e.confidence, 0);
  const weightedVRAM = topEstimates.reduce((sum, e) => sum + (e.vram * e.confidence), 0) / totalConfidence;
  
  const finalVRAM = Math.max(2, Math.min(16, Math.round(weightedVRAM * 10) / 10));
  const methods = topEstimates.map(e => `${e.method} (${e.vram}GB, conf:${e.confidence})`).join(" + ");

  console.log("VRAM estimation details:", {
    allEstimates: estimates,
    topEstimates,
    weightedVRAM,
    finalVRAM,
    calculation: `(${topEstimates.map(e => `${e.vram}*${e.confidence}`).join(" + ")}) / ${totalConfidence} = ${weightedVRAM.toFixed(2)}`
  });

  return { vram: finalVRAM, method: methods };
}

/**
 * Determine GPU tier based on VRAM and vendor
 */
function determineGPUTier(vram: number, vendor?: string, architecture?: string): "low" | "medium" | "high" {
  const v = vendor?.toLowerCase() || "";
  const arch = architecture?.toLowerCase() || "";

  // High-end indicators
  const isAppleSilicon = v.includes("apple") || arch.includes("metal");
  const isHighEndNvidia = v.includes("nvidia");
  const isHighEndAMD = v.includes("amd");

  if (isAppleSilicon && arch.includes("metal-3")) {
    return "high"; // M3+ series
  }

  if (isAppleSilicon && arch.includes("metal-2")) {
    return vram >= 6 ? "high" : "medium"; // M1/M2 series
  }

  if ((isHighEndNvidia || isHighEndAMD) && vram >= 6) {
    return "high";
  }

  if (vram >= 5) {
    return "high";
  } else if (vram >= 3) {
    return "medium";
  } else {
    return "low";
  }
}

export async function detectSystemCapabilities(): Promise<SystemCapabilities> {
  let gpuTier: "low" | "medium" | "high" = "medium";
  let estimatedVRAM = 4;
  let gpuInfo = "Unknown GPU";
  let detectionMethod = "fallback";

  try {
    const nav = navigator as unknown as NavigatorGPU;
    const navWithMemory = navigator as NavigatorWithMemory;
    
    // Get device memory if available
    const deviceMemory = navWithMemory.deviceMemory;
    console.log("Device Memory (RAM):", deviceMemory, "GB");

    // Check if WebGPU is available
    if (!nav.gpu) {
      console.warn("WebGPU not available");
      gpuTier = "low";
      estimatedVRAM = 2;
      gpuInfo = "WebGPU not supported";
      detectionMethod = "no-webgpu";
    } else {
      const adapter = await nav.gpu.requestAdapter();

      if (adapter) {
        // Get adapter info
        let adapterInfo = adapter.info;
        
        // Try new API if old one doesn't exist
        if (!adapterInfo && adapter.requestAdapterInfo) {
          try {
            adapterInfo = await adapter.requestAdapterInfo();
          } catch (e) {
            console.log("Could not get adapter info via requestAdapterInfo", e);
          }
        }

        const vendor = adapterInfo?.vendor?.toLowerCase() || "";
        const device = adapterInfo?.device?.toLowerCase() || "";
        const architecture = adapterInfo?.architecture?.toLowerCase() || "";
        const limits = adapter.limits;

        console.log("GPU Detection - Raw data:", {
          vendor,
          device,
          architecture,
          maxBufferSize: limits.maxBufferSize,
          maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
          deviceMemory
        });

        // Build GPU info string
        gpuInfo = [
          adapterInfo?.vendor,
          adapterInfo?.device,
          adapterInfo?.architecture,
          adapterInfo?.description
        ].filter(Boolean).join(" ") || "GPU detected";

        // Calculate VRAM using multiple methods
        const vramResult = calculateVRAMEstimate({
          maxBufferSize: limits.maxBufferSize,
          deviceMemory,
          vendor,
          architecture,
        });

        estimatedVRAM = vramResult.vram;
        detectionMethod = vramResult.method;

        // Determine tier
        gpuTier = determineGPUTier(estimatedVRAM, vendor, architecture);

        // Adjust GPU info string
        if (vendor.includes("apple") || architecture.includes("metal")) {
          gpuInfo = `Apple GPU (${architecture || "Metal"})`;
        } else if (vendor.includes("nvidia")) {
          gpuInfo = `NVIDIA ${device || "GPU"}`;
        } else if (vendor.includes("amd")) {
          gpuInfo = `AMD ${device || "GPU"}`;
        } else if (vendor.includes("intel")) {
          gpuInfo = `Intel ${device || "GPU"}`;
        }

        console.log("GPU Detection - Final:", {
          gpuInfo,
          estimatedVRAM,
          gpuTier,
          detectionMethod
        });
      }
    }
  } catch (error) {
    console.warn("Could not detect GPU capabilities:", error);
    gpuTier = "medium";
    estimatedVRAM = 4;
    detectionMethod = "error-fallback";
  }

  // Determine which models can run
  const canRunModels: string[] = [];
  const modelVRAMRequirements: Record<string, number> = {
    "gemma-2-2b": 1.9,
    "qwen2.5-1.5b": 2.2,
    "phi-3.5-mini": 2.8,
    "mistral-7b": 3.8,
    "qwen2.5-coder-7b": 4.8,
    "llama-3.2-3b": 6.2,
  };

  Object.entries(modelVRAMRequirements).forEach(([id, required]) => {
    // Use 75% of estimated VRAM as threshold for safety
    // This accounts for overhead and ensures smooth operation
    if (required <= estimatedVRAM * 0.75) {
      canRunModels.push(id);
    }
  });

  // If no models can run, at least allow the smallest one
  if (canRunModels.length === 0) {
    canRunModels.push("gemma-2-2b");
    console.warn("No models met VRAM requirements, allowing smallest model");
  }

  // Recommend best model that can run
  let recommendedModelId = "gemma-2-2b";
  if (canRunModels.includes("llama-3.2-3b")) {
    recommendedModelId = "llama-3.2-3b";
  } else if (canRunModels.includes("qwen2.5-coder-7b")) {
    recommendedModelId = "qwen2.5-coder-7b";
  } else if (canRunModels.includes("mistral-7b")) {
    recommendedModelId = "mistral-7b";
  } else if (canRunModels.includes("phi-3.5-mini")) {
    recommendedModelId = "phi-3.5-mini";
  } else if (canRunModels.includes("qwen2.5-1.5b")) {
    recommendedModelId = "qwen2.5-1.5b";
  }

  const result = {
    estimatedVRAM,
    gpuTier,
    recommendedModelId,
    canRunModels,
    gpuInfo,
    detectionMethod,
  };

  console.log("Final system capabilities:", result);

  return result;
}