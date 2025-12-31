// src/shared/types/index.ts

export type Screen = "home" | "settings" | "llm-setup";

export interface NavigationProps {
  onNavigate: (screen: Screen) => void;
}

export type ThemeMode = "light" | "dark";

export type LanguageCode = "en" | "ru";

export interface Settings {
  theme: ThemeMode;
  language: LanguageCode;
  floatingButtonEnabled: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  size: string;
  tier: "small" | "medium" | "large";
  specialty: string;
  description: string;
  vram: number;
  features: string[];
}