// Path: src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import sv from "./sv.json";
import en from "./en.json";

const STORAGE_KEY = "lang";

function getInitialLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "sv" || saved === "en") return saved;

  // fallback: browser language
  const nav = (navigator.language || "").toLowerCase();
  if (nav.startsWith("en")) return "en";
  return "sv";
}

const initialLng = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    sv: { translation: sv },
    en: { translation: en },
  },
  lng: initialLng,
  fallbackLng: "sv",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

// Sync <html lang="..."> + persist
document.documentElement.lang = i18n.language;
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
