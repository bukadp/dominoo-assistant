// src/pages/model-loader/ModelLoader.tsx
import React, { useEffect, useState } from "react";
import { Box, Button, Typography, LinearProgress, Alert } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { webLLMManager } from "../../features/model-management/lib/webllm-manager";
import { getModelById } from "../../features/model-management/lib/model-configs";

const ModelLoader: React.FC = () => {
  const [modelName, setModelName] = useState<string>("AI Model");
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [statusMessage, setStatusMessage] = useState<string>("Initializing...");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const loadModel = async () => {
      // Get modelId from URL query parameters
      const params = new URLSearchParams(window.location.search);
      const id = params.get("modelId");
      
      if (!id) {
        setStatus("error");
        setErrorMessage("No model selected");
        setStatusMessage("Error");
        return;
      }
      
      // Get model info
      const model = getModelById(id);
      if (model) {
        setModelName(model.name);
      }

      // Set up WebLLM callbacks
      webLLMManager.setCallbacks({
        onProgress: (prog, message) => {
          setProgress(prog);
          setStatusMessage(message || "Loading model...");
        },
        onModelLoaded: () => {
          setStatus("success");
          setProgress(100);
          setStatusMessage("Model installed successfully!");
          
          // Auto-close tab after 2 seconds
          setTimeout(() => {
            chrome.tabs.getCurrent((tab) => {
              if (tab?.id) {
                chrome.tabs.remove(tab.id);
              }
            });
          }, 2000);
        },
        onError: (error) => {
          setStatus("error");
          setErrorMessage(error.message);
          setStatusMessage("Installation failed");
        },
      });

      // Start loading model
      try {
        await webLLMManager.loadModel(id);
      } catch (error) {
        setStatus("error");
        setErrorMessage((error as Error).message);
        setStatusMessage("Installation failed");
      }
    };

    loadModel();
  }, []);

  const handleClose = () => {
    chrome.tabs.getCurrent((tab) => {
      if (tab?.id) {
        chrome.tabs.remove(tab.id);
      }
    });
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        gap: 3,
        p: 4,
      }}
    >
      {/* Icon */}
      {status === "loading" && (
        <AutoAwesomeIcon
          sx={{
            fontSize: 80,
            color: "primary.main",
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.5 },
            },
          }}
        />
      )}
      {status === "success" && (
        <CheckCircleOutlineIcon
          sx={{
            fontSize: 80,
            color: "success.main",
          }}
        />
      )}
      {status === "error" && (
        <ErrorOutlineIcon
          sx={{
            fontSize: 80,
            color: "error.main",
          }}
        />
      )}

      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          textAlign: "center",
        }}
      >
        {status === "loading" && "Installing AI Model"}
        {status === "success" && "Installation Complete"}
        {status === "error" && "Installation Failed"}
      </Typography>

      {/* Model Name */}
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          textAlign: "center",
        }}
      >
        {modelName}
      </Typography>

      {/* Progress Bar */}
      {status === "loading" && (
        <Box sx={{ width: "100%", maxWidth: 500 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {statusMessage}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {progress.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ display: "block", mt: 1, textAlign: "center" }}
          >
            This may take a few minutes on first download
          </Typography>
        </Box>
      )}

      {/* Success Message */}
      {status === "success" && (
        <Alert severity="success" sx={{ maxWidth: 500 }}>
          Model successfully installed! This tab will close automatically.
        </Alert>
      )}

      {/* Error Message */}
      {status === "error" && (
        <Box sx={{ width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity="error">
            {errorMessage || "An error occurred during installation"}
          </Alert>
          <Button
            variant="contained"
            size="large"
            onClick={handleClose}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.8)",
              },
            }}
          >
            Close Tab
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ModelLoader;