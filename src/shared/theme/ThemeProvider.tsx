// src/shared/theme/ThemeProvider.tsx
import React, { useState, useEffect, ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, Theme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme } from "./themes/light-theme";
import { darkTheme } from "./themes/dark-theme";
import { ThemeContext } from "../theme/ThemeContext";

type ThemeMode = "light" | "dark";

interface Props {
  children: ReactNode;
}

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    // Load saved theme from storage
    chrome.storage.local.get(["theme"], (result) => {
      if (result.theme && (result.theme === "light" || result.theme === "dark")) {
        setMode(result.theme as ThemeMode);
      }
    });
  }, []);

  const toggleTheme = () => {
    const newMode: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    // Save to storage
    chrome.storage.local.set({ theme: newMode });
  };

  const theme: Theme = mode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};