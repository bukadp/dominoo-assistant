// src/pages/model-loader/model-loader-main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import ModelLoader from "./ModelLoader";
import { ThemeProvider } from "../../shared/theme/ThemeProvider";
import "../../styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ModelLoader />
    </ThemeProvider>
  </React.StrictMode>
);