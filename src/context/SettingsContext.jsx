// src/context/SettingsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";

const DEFAULTS = {
  hero_title:      "Måttbeställ din bänkskiva online",
  hero_subtitle:   "Välj material, ange mått och få pris direkt. Offerten skickas till din e-post.",
  hero_cta:        "Beräkna & begär offert",
  accent_color:    "#059669",
  heading_color:   "#111827",
  body_color:      "#374151",
  logo_size:       "normal",
  hero_brightness: "100",
  deal_text:       "Veckans deal: Diskho från Intra ingår vid beställning av stenskiva.",
  deal_visible:    "true",
};

const SettingsContext = createContext(DEFAULTS);

function applySettings(s) {
  const root = document.documentElement;
  root.style.setProperty("--accent",         s.accent_color  || DEFAULTS.accent_color);
  root.style.setProperty("--heading-color",   s.heading_color || DEFAULTS.heading_color);
  root.style.setProperty("--body-color",      s.body_color    || DEFAULTS.body_color);
  root.style.setProperty("--hero-brightness", (s.hero_brightness || "100") + "%");

  // Logo size
  const sizes = { small: "100px", normal: "140px", large: "200px" };
  root.style.setProperty("--logo-size", sizes[s.logo_size] || sizes.normal);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then((r) => r.json())
      .then((data) => {
        const merged = { ...DEFAULTS, ...data };
        setSettings(merged);
        applySettings(merged);
      })
      .catch(() => applySettings(DEFAULTS));
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
