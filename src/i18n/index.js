// Path: src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// =====================
// SV (core)
// =====================
import svCommon from "./sv/common";
import svLanding from "./sv/landing";
import svMaterials from "./sv/materials";
import svCalculator from "./sv/calculator";

// SV pages (footer/legal)
import svPrivacy from "./sv/pages/privacy";
import svTerms from "./sv/pages/terms";
import svMaintenance from "./sv/pages/maintenance";
import svSustainability from "./sv/pages/sustainability";
import svGuarantee from "./sv/pages/guarantee";

// SV material pages (detail pages)
import svMarble from "./sv/pages/materialPages/marble";
import svGranite from "./sv/pages/materialPages/granite";
import svComposite from "./sv/pages/materialPages/composite";
import svOnyx from "./sv/pages/materialPages/onyx";
import svLimestone from "./sv/pages/materialPages/limestone";
import svTerrazzo from "./sv/pages/materialPages/terrazzo";
import svQuartzite from "./sv/pages/materialPages/quartzite";
import svTravertine from "./sv/pages/materialPages/travertine";
import svSemiPrecious from "./sv/pages/materialPages/semiPrecious";
import svRecycledGlass from "./sv/pages/materialPages/recycledGlass";

// =====================
// EN (core)
// =====================
import enCommon from "./en/common";
import enLanding from "./en/landing";
import enMaterials from "./en/materials";
import enCalculator from "./en/calculator";

// EN pages (footer/legal)
import enPrivacy from "./en/pages/privacy";
import enTerms from "./en/pages/terms";
import enMaintenance from "./en/pages/maintenance";
import enSustainability from "./en/pages/sustainability";
import enGuarantee from "./en/pages/guarantee";

// EN material pages (detail pages)
import enMarble from "./en/pages/materialPages/marble";
import enGranite from "./en/pages/materialPages/granite";
import enComposite from "./en/pages/materialPages/composite";
import enOnyx from "./en/pages/materialPages/onyx";
import enLimestone from "./en/pages/materialPages/limestone";
import enTerrazzo from "./en/pages/materialPages/terrazzo";
import enQuartzite from "./en/pages/materialPages/quartzite";
import enTravertine from "./en/pages/materialPages/travertine";
import enSemiPrecious from "./en/pages/materialPages/semiPrecious";
import enRecycledGlass from "./en/pages/materialPages/recycledGlass";

const resources = {
  sv: {
    translation: {
      // core bundles
      ...svCommon,
      ...svLanding,
      ...svMaterials,
      ...svCalculator,

      // footer/legal pages mounted by key
      privacy: svPrivacy,
      terms: svTerms,
      maintenance: svMaintenance,
      sustainability: svSustainability,
      guarantee: svGuarantee,

      // material detail pages mounted by key
      materialPages: {
        marble: svMarble,
        granite: svGranite,
        composite: svComposite,
        onyx: svOnyx,
        limestone: svLimestone,
        terrazzo: svTerrazzo,
        quartzite: svQuartzite,
        travertine: svTravertine,
        semiPrecious: svSemiPrecious,
        recycledGlass: svRecycledGlass,
      },
    },
  },

  en: {
    translation: {
      // core bundles
      ...enCommon,
      ...enLanding,
      ...enMaterials,
      ...enCalculator,

      // footer/legal pages mounted by key
      privacy: enPrivacy,
      terms: enTerms,
      maintenance: enMaintenance,
      sustainability: enSustainability,
      guarantee: enGuarantee,

      // material detail pages mounted by key
      materialPages: {
        marble: enMarble,
        granite: enGranite,
        composite: enComposite,
        onyx: enOnyx,
        limestone: enLimestone,
        terrazzo: enTerrazzo,
        quartzite: enQuartzite,
        travertine: enTravertine,
        semiPrecious: enSemiPrecious,
        recycledGlass: enRecycledGlass,
      },
    },
  },
};

const normalizeLang = (lng) =>
  String(lng || "sv").toLowerCase().startsWith("en") ? "en" : "sv";

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "sv" || saved === "en") return saved;
  } catch {
    // no-op
  }

  // Default to Swedish regardless of browser language
  return "sv";
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: "sv",
  returnNull: false,
  returnEmptyString: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

try {
  document.documentElement.lang = normalizeLang(i18n.language);
} catch {
  // no-op
}

i18n.on("languageChanged", (lng) => {
  const normalized = normalizeLang(lng);

  try {
    localStorage.setItem("lang", normalized);
  } catch {
    // no-op
  }

  try {
    document.documentElement.lang = normalized;
  } catch {
    // no-op
  }
});

export default i18n;
  