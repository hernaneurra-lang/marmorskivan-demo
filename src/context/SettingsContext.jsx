// src/context/SettingsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";

const DEFAULTS = {
  // Hero
  hero_title:       "Måttbeställ din bänkskiva online",
  hero_subtitle:    "Välj material, ange mått och få pris direkt. Offerten skickas till din e-post.",
  hero_cta:         "Beräkna & begär offert",
  deal_text:        "Veckans deal: Diskho från Intra ingår vid beställning av stenskiva.",
  deal_visible:     "true",
  // Colors
  accent_color:     "#059669",
  heading_color:    "#111827",
  body_color:       "#374151",
  hero_brightness:  "100",
  // Branding
  logo_size:        "normal",
  // Chat widget
  chat_online:      "true",
  chat_greeting:    "Hej! Hur kan jag hjälpa dig med din bänkskiva? 🪨",
  chat_bot_name:    "Marmorskivan AI",
  chat_bot_avatar:  "🪨",
  // Navigation & SEO
  nav_cta_text:     "Begär offert",
  seo_title:        "Marmorskivan",
  seo_description:  "Måttbeställ bänkskivor av marmor, granit och kvartskomposit.",
  // Contact info
  contact_phone:    "",
  contact_email:    "info@marmorskivan.se",
  contact_address:  "",
  contact_hours:    "Mån–Fre 8–17",
  // Footer
  footer_company:   "Marmorskivan AB",
  footer_tagline:   "Sveriges smidigaste väg till din nya bänkskiva",
  footer_orgnr:     "",
  // Calculator
  calc_title:       "Beräkna din bänkskiva",
  calc_subtitle:    "Ange dina mått och välj material — få pris direkt.",
  calc_confirm:     "Tack! Vi återkommer med en offert inom 24 timmar.",
};

const SettingsContext = createContext(DEFAULTS);

function applySettings(s) {
  const root = document.documentElement;
  root.style.setProperty("--accent",         s.accent_color  || DEFAULTS.accent_color);
  root.style.setProperty("--heading-color",   s.heading_color || DEFAULTS.heading_color);
  root.style.setProperty("--body-color",      s.body_color    || DEFAULTS.body_color);
  root.style.setProperty("--hero-brightness", (s.hero_brightness || "100") + "%");
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
