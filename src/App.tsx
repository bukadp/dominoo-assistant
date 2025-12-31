// src/App.tsx
import React, { useState } from "react";
import { Box } from "@mui/material";
import PopupHome from "./pages/popup/PopupHome";
import PopupSettings from "./pages/popup/PopupSettings";
import PopupLLMSetup from "./pages/popup/PopupLLMSetup";

type Screen = "home" | "settings" | "llm-setup";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {currentScreen === "home" && <PopupHome onNavigate={navigateTo} />}
      {currentScreen === "settings" && <PopupSettings onNavigate={navigateTo} />}
      {currentScreen === "llm-setup" && <PopupLLMSetup onNavigate={navigateTo} />}
    </Box>
  );
};

export default App;