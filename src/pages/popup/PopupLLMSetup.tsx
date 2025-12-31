// src/pages/popup/PopupLLMSetup.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Chip,
  Tooltip,
  LinearProgress,
  Alert,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { NavigationProps } from "../../shared/types/index";
import { useModelManager } from "../../features/model-management/hooks/useModelManager";
import { getAllModels } from "../../features/model-management/lib/model-configs";

const PopupLLMSetup: React.FC<NavigationProps> = ({ onNavigate }) => {
  const { currentModelId, isLoading, loadingProgress, capabilities, error, loadModel } = useModelManager();
  
  // Initialize with current model or recommended model
  const getInitialModel = () => {
    if (currentModelId) return currentModelId;
    if (capabilities?.recommendedModelId) return capabilities.recommendedModelId;
    return "";
  };

  const [selectedModel, setSelectedModel] = useState<string>(getInitialModel);

  // Update selected model when currentModelId or capabilities change
  // But only if selectedModel is still empty
  React.useEffect(() => {
    if (!selectedModel) {
      if (currentModelId) {
        setSelectedModel(currentModelId);
      } else if (capabilities?.recommendedModelId) {
        setSelectedModel(capabilities.recommendedModelId);
      }
    }
  }, [currentModelId, capabilities, selectedModel]);

  const models = getAllModels();

  const handleConfirm = async () => {
    if (!selectedModel) return;
    await loadModel(selectedModel);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "small":
        return "success";
      case "medium":
        return "warning";
      case "large":
        return "error";
      default:
        return "default";
    }
  };

  const canRunModel = (vramRequired: number): boolean => {
    if (!capabilities) return true;
    return vramRequired <= capabilities.estimatedVRAM * 0.8;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <IconButton
          size="small"
          onClick={() => onNavigate("home")}
          sx={{ mr: 2, color: "text.primary" }}
          disabled={isLoading}
        >
          <ArrowBackOutlinedIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          AI Model Manager
        </Typography>
      </Box>

      {/* System Info */}
      {capabilities && (
        <Box sx={{ p: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>System:</strong> {capabilities.gpuInfo || "Detecting..."}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>Estimated VRAM:</strong> ~{capabilities.estimatedVRAM.toFixed(1)} GB
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>GPU Tier:</strong>{" "}
            <Chip
              label={capabilities.gpuTier.toUpperCase()}
              size="small"
              color={
                capabilities.gpuTier === "high"
                  ? "success"
                  : capabilities.gpuTier === "medium"
                  ? "warning"
                  : "error"
              }
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          </Typography>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ m: 2, mb: 0 }}>
          {error}
        </Alert>
      )}

      {/* Model List */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        <RadioGroup value={selectedModel} onChange={(e) => !isLoading && setSelectedModel(e.target.value)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {models.map((model) => {
              const canRun = canRunModel(model.vramRequired);
              const isRecommended = capabilities?.recommendedModelId === model.id;
              const isCurrent = currentModelId === model.id;

              return (
                <Card
                  key={model.id}
                  sx={{
                    border: selectedModel === model.id ? 2 : 1,
                    borderColor: selectedModel === model.id ? "primary.main" : "divider",
                    cursor: isLoading || !canRun ? "not-allowed" : "pointer",
                    opacity: isLoading || !canRun ? 0.5 : 1,
                    bgcolor: !canRun ? "action.disabledBackground" : "background.paper",
                  }}
                  onClick={() => !isLoading && canRun && setSelectedModel(model.id)}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <FormControlLabel
                        value={model.id}
                        control={<Radio size="small" disabled={isLoading || !canRun} />}
                        label=""
                        sx={{ m: 0 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {model.name}
                          </Typography>
                          <Chip
                            label={model.tier.toUpperCase()}
                            size="small"
                            color={getTierColor(model.tier)}
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {model.size}
                          </Typography>
                          {isRecommended && (
                            <Chip
                              icon={<CheckCircleOutlinedIcon />}
                              label="Recommended"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.65rem" }}
                            />
                          )}
                          {isCurrent && (
                            <Chip
                              icon={<CheckCircleOutlinedIcon />}
                              label="Active"
                              size="small"
                              color="primary"
                              sx={{ height: 20, fontSize: "0.65rem" }}
                            />
                          )}
                          {!canRun && (
                            <Chip
                              icon={<WarningAmberOutlinedIcon />}
                              label="Insufficient VRAM"
                              size="small"
                              color="error"
                              sx={{ height: 20, fontSize: "0.65rem" }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="primary" sx={{ display: "block", mb: 0.5 }}>
                          {model.specialty}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                          {model.description}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {model.features.map((feature) => (
                            <Chip
                              key={feature}
                              label={feature}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: "0.65rem" }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Tooltip title={model.description} placement="left">
                        <IconButton size="small" sx={{ color: "text.secondary" }}>
                          <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </RadioGroup>
      </Box>

      {/* Loading Progress */}
      {isLoading && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Downloading and initializing model...
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {loadingProgress.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={loadingProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            This may take a few minutes on first download
          </Typography>
        </Box>
      )}

      {/* Confirm Button */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedModel || isLoading || selectedModel === currentModelId}
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.8)",
            },
          }}
        >
          {isLoading
            ? `Installing... ${loadingProgress.toFixed(0)}%`
            : selectedModel === currentModelId
            ? "Model Already Installed"
            : "Install Model"}
        </Button>
      </Box>
    </Box>
  );
};

export default PopupLLMSetup;