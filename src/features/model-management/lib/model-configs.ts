// src/features/model-management/lib/model-configs.ts

export interface ModelConfig {
  id: string;
  name: string;
  modelId: string; // WebLLM model ID
  size: string;
  vramRequired: number; // in GB
  tier: "small" | "medium" | "large";
  specialty: string;
  description: string;
  features: string[];
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "gemma-2-2b": {
    id: "gemma-2-2b",
    name: "Gemma-2-2B-it",
    modelId: "gemma-2-2b-it-q4f16_1-MLC",
    size: "1.9 GB",
    vramRequired: 1.9,
    tier: "small",
    specialty: "Translation & Quick tasks",
    description: "Multilingual support (RU/EN), fast responses, best for quick translations",
    features: ["Translation", "Text Enhancement", "Fast"],
  },
  "qwen2.5-1.5b": {
    id: "qwen2.5-1.5b",
    name: "Qwen2.5-1.5B-Instruct",
    modelId: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    size: "2.2 GB",
    vramRequired: 2.2,
    tier: "small",
    specialty: "Summarization & Context",
    description: "Excellent context understanding, page analysis, meeting summaries",
    features: ["Summarization", "Context Analysis", "Structured Data"],
  },
  "phi-3.5-mini": {
    id: "phi-3.5-mini",
    name: "Phi-3.5-mini-instruct",
    modelId: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    size: "2.8 GB",
    vramRequired: 2.8,
    tier: "medium",
    specialty: "Technical & Code",
    description: "Strong technical reasoning, code understanding, developer-focused",
    features: ["Technical", "Code", "Documentation"],
  },
  "mistral-7b": {
    id: "mistral-7b",
    name: "Mistral-7B-Instruct-v0.3",
    modelId: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
    size: "3.8 GB",
    vramRequired: 3.8,
    tier: "medium",
    specialty: "Creative & General",
    description: "Excellent instruction following, creative writing, email composition",
    features: ["Creative Writing", "Email", "Templates"],
  },
  "qwen2.5-coder-7b": {
    id: "qwen2.5-coder-7b",
    name: "Qwen2.5-Coder-7B-Instruct",
    modelId: "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
    size: "4.8 GB",
    vramRequired: 4.8,
    tier: "large",
    specialty: "Code & Structured Tasks",
    description: "Best-in-class coding, technical analysis, structured data extraction",
    features: ["Advanced Code", "Technical", "JSON/Markdown"],
  },
  "llama-3.2-3b": {
    id: "llama-3.2-3b",
    name: "Llama-3.2-3B-Instruct",
    modelId: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    size: "6.2 GB",
    vramRequired: 6.2,
    tier: "large",
    specialty: "Advanced Reasoning & Long Context",
    description: "Superior reasoning, 8K context, 100+ languages, highest quality",
    features: ["Best Quality", "Long Context", "Multilingual"],
  },
};

export const getModelById = (id: string): ModelConfig | undefined => {
  return MODEL_CONFIGS[id];
};

export const getAllModels = (): ModelConfig[] => {
  return Object.values(MODEL_CONFIGS);
};