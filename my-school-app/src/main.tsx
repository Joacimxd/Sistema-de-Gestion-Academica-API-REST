import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles"; // Para MUI
import CssBaseline from "@mui/material/CssBaseline"; // Para reset de CSS en MUI

const darkTheme = createTheme({
  palette: {
    mode: "dark", // O 'light' para un tema claro
    primary: {
      main: "#90caf9", // Un azul claro bonito
    },
    secondary: {
      main: "#f48fb1", // Un rosa para acentos
    },
  },
  typography: {
    fontFamily: ["Roboto", "Arial", "sans-serif"].join(","),
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Provee un reset de CSS para Material Design */}
      <AppRouter />
    </ThemeProvider>
  </React.StrictMode>
);
