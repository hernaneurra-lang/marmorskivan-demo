// Path: src/main.jsx
import "./i18n/index"; // ✅ load i18n before app renders

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AppRoutes from "./router/Router.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import "./index.css";

const container = document.getElementById("root");

createRoot(container).render(
  <React.StrictMode>
    <HelmetProvider>
      <SettingsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </SettingsProvider>
    </HelmetProvider>
  </React.StrictMode>
);
