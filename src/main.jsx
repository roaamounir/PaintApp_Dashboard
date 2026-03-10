import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import './i18n/i18n.js';
import "./index.css";
import { AppProvider } from "./context/AppContext";
createRoot(document.getElementById("root")).render(
  <AppProvider>
    <App />
  </AppProvider>,
);
