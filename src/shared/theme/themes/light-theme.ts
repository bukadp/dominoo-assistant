// src/shared/theme/themes/light-theme.ts
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000", // Black
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FFFFFF", // White
      contrastText: "#000000",
    },
    background: {
      default: "#E8EEF2", // Gray-blue
      paper: "#FFFFFF",
    },
    text: {
      primary: "#000000",
      secondary: "#6B7280",
    },
    divider: "#E5E7EB",
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h6: {
      fontWeight: 600,
      fontSize: "1.1rem",
    },
    body1: {
      fontSize: "0.9rem",
    },
    body2: {
      fontSize: "0.85rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4, // Minimal rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid #E5E7EB",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid #E5E7EB",
        },
      },
    },
  },
});