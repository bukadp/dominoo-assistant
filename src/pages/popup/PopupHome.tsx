// src/pages/popup/PopupHome.tsx
import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  IconButton, 
  Button, 
  Tabs, 
  Tab, 
  Chip, 
  CircularProgress,
  Tooltip
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { NavigationProps } from "../../shared/types";
import { useModelManager } from "../../features/model-management/hooks/useModelManager";
import { MODEL_CONFIGS } from "../../features/model-management/lib/model-configs";
import PopupChat from "./PopupChat";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ height: "100%", display: value === index ? "flex" : "none", flexDirection: "column" }}>
      {children}
    </div>
  );
};

const PopupHome: React.FC<NavigationProps> = ({ onNavigate }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const { currentModelId, isEnabled, isLoading, loadingProgress, error, toggleEnabled } = useModelManager();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const currentModel = currentModelId ? MODEL_CONFIGS[currentModelId] : null;

  const handleToggleEnabled = async () => {
    if (!currentModelId) {
      onNavigate("llm-setup");
      return;
    }
    await toggleEnabled();
  };

  const getToggleButtonText = () => {
    if (isLoading) return `Loading ${loadingProgress.toFixed(0)}%`;
    if (!currentModelId) return "Disabled AI model";
    return isEnabled ? "Disable AI model" : "Enable AI model";
  };

  const truncateModelName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + "...";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          minHeight: 64,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, flexShrink: 0 }}>
            Dominoo
          </Typography>
          {currentModel ? (
            <Chip
              icon={isEnabled ? <CheckCircleOutlinedIcon /> : undefined}
              label={currentModel.name}
              size="small"
              color={isEnabled ? "success" : "default"}
              sx={{ 
                height: 24, 
                fontSize: "0.7rem",
                maxWidth: 200,
                opacity: isEnabled ? 1 : 0.6,
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }
              }}
            />
          ) : (
            <Chip
              label="No model"
              size="small"
              color="default"
              sx={{ height: 24, fontSize: "0.7rem", opacity: 0.6 }}
            />
          )}
        </Box>
        <IconButton
          size="small"
          onClick={() => onNavigate("settings")}
          sx={{ color: "text.primary", flexShrink: 0 }}
        >
          <SettingsOutlinedIcon />
        </IconButton>
      </Box>

      {/* Error Display */}
      {error && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: "error.light",
            color: "error.dark",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ErrorOutlineIcon fontSize="small" />
          <Typography variant="caption" sx={{ flex: 1, overflow: "hidden" }}>
            {error}
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ p: 2, display: "flex", gap: 1 }}>
        <Tooltip title={currentModel?.name || "Select an AI model"} placement="top">
          <Button
            fullWidth
            variant="outlined"
            onClick={() => onNavigate("llm-setup")}
            disabled={isLoading}
            sx={{
              color: "text.primary",
              borderColor: "divider",
              textTransform: "none",
              justifyContent: "flex-start",
              overflow: "hidden",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width: "100%",
                textAlign: "left",
              }}
            >
              {currentModel 
                ? truncateModelName(currentModel.name, 18)
                : "Select Model"}
            </Box>
          </Button>
        </Tooltip>
        <Button
          fullWidth
          variant={isEnabled ? "contained" : "outlined"}
          onClick={handleToggleEnabled}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            color: isEnabled ? "primary.contrastText" : "text.primary",
            bgcolor: isEnabled ? "primary.main" : "transparent",
            borderColor: "divider",
            textTransform: "none",
            minWidth: 160,
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: isEnabled ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          {getToggleButtonText()}
        </Button>
      </Box>

      {/* Model Status Info */}
      {currentModel && !isLoading && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: isEnabled ? "success.light" : "background.paper",
              borderRadius: 1,
              border: 1,
              borderColor: isEnabled ? "success.main" : "divider",
              overflow: "hidden",
            }}
          >
            <Typography 
              variant="caption" 
              color={isEnabled ? "success.dark" : "text.secondary"}
              sx={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <strong>Status:</strong> {isEnabled ? "Active" : "Disabled"} • {currentModel.size} • {currentModel.specialty}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Loading Progress */}
      {isLoading && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: "primary.light",
              borderRadius: 1,
              border: 1,
              borderColor: "primary.main",
            }}
          >
            <Typography variant="caption" color="primary.dark" sx={{ display: "block", mb: 0.5 }}>
              Loading model... {loadingProgress.toFixed(0)}%
            </Typography>
            <Box sx={{ width: "100%", height: 4, bgcolor: "rgba(0,0,0,0.1)", borderRadius: 2, overflow: "hidden" }}>
              <Box 
                sx={{ 
                  width: `${loadingProgress}%`, 
                  height: "100%", 
                  bgcolor: "primary.main",
                  transition: "width 0.3s ease"
                }} 
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* No Model Selected */}
      {!currentModel && !isLoading && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: "warning.light",
              borderRadius: 1,
              border: 1,
              borderColor: "warning.main",
            }}
          >
            <Typography variant="caption" color="warning.dark">
              ⚠️ No model selected. Click "Select Model" to choose an AI model.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minHeight: 48,
            },
          }}
        >
          <Tab label="Chat" disabled={!isEnabled} />
          <Tab label="History" />
          <Tab label="Templates" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <TabPanel value={currentTab} index={0}>
          <PopupChat />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">History will appear here...</Typography>
          </Box>
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">Templates placeholder</Typography>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default PopupHome;