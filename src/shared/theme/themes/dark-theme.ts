// src/shared/theme/themes/dark-theme.ts
import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FFFFFF", // White
      contrastText: "#000000",
    },
    secondary: {
      main: "#000000", // Black
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#1A1D23", // Dark gray-blue
      paper: "#242831",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#9CA3AF",
    },
    divider: "#374151",
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
    borderRadius: 4,
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
          border: "1px solid #374151",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid #374151",
        },
      },
    },
  },
});