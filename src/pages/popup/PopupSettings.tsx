// src/pages/popup/PopupSettings.tsx
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Switch,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { NavigationProps } from "../../shared/types/index";
// import { useTheme } from "@/shared/theme/ThemeContext"; // Добавим позже

const PopupSettings: React.FC<NavigationProps> = ({ onNavigate }) => {
  // Temporary state - logic will be added later
  const [language, setLanguage] = React.useState("en");
  const [darkMode, setDarkMode] = React.useState(false);
  const [floatingButton, setFloatingButton] = React.useState(false);

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
        >
          <ArrowBackOutlinedIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Settings
        </Typography>
      </Box>

      {/* Settings Content */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Language Selector */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Interface Language
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ru">Русский</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Theme Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Dark Mode
          </Typography>
          <Switch
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
        </Box>

        {/* Floating Button Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Floating Button
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Show AI assistant button on all pages
            </Typography>
          </Box>
          <Switch
            checked={floatingButton}
            onChange={(e) => setFloatingButton(e.target.checked)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PopupSettings;