// Path: src/App.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

import MaterialPage from "./components/MaterialPage";
import CalculatorPage from "./pages/CalculatorPage";
import SiteFooter from "./components/SiteFooter";

import { buildImageCandidates, useImagesMap } from "./components/MaterialsSection";

// Centraliserad logik
import { buildDynamicLexicon } from "./smartQuery";
import {
  parseMaterialsCsv,
  computeBaseKey,
  toInt,
  slug,
  normalizeImgPath,
  parseNumberLoose,
} from "./lib/materialUtils";

/* -------------------------------------------------------
   DYNAMISK VECKO-LOGIK
------------------------------------------------------- */
function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const WEEKLY_MESSAGES = {
  6: {
    sv: "Just nu: Exklusiv blandare från Gattoni ingår vid köp av bänkskiva.",
    en: "Right now: Exclusive Gattoni tap included with any worktop purchase.",
  },
};

/* -------------------------------------------------------
   LOCALSTORAGE HELPERS
------------------------------------------------------- */
const STORAGE_KEY = "marmorskivan_calculator_state";

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn("Could not load from localStorage:", e);
    return null;
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear localStorage:", e);
  }
}

/* -------------------------------------------------------
   ✅ FÖRBÄTTRAD KATEGORI-NORMALISERING
   Hanterar URL-parametrar som ?cat=Marmor, ?cat=Keramik, etc.
------------------------------------------------------- */
function normalizeCategoryFromQuery(cat) {
  if (!cat) return "";
  
  const lower = cat.toLowerCase().trim();
  
  // Mappning från URL-parameter till intern kategori
  const categoryMap = {
    // Marmor
    "marmor": "Marmor",
    "marble": "Marmor",
    
    // Granit
    "granit": "Granit",
    "granite": "Granit",
    
    // Keramik
    "keramik": "Keramik",
    "ceramic": "Keramik",
    "ceramics": "Keramik",
    
    // Komposit / Kvarts
    "komposit": "Komposit",
    "kompositsten": "Komposit",
    "composite": "Komposit",
    "kvarts": "Komposit",
    "quartz": "Komposit",
    
    // Kvartsit
    "kvartsit": "Kvartsit",
    "quartzite": "Kvartsit",
    
    // Kalksten
    "kalksten": "Kalksten",
    "limestone": "Kalksten",
    
    // Travertin
    "travertin": "Travertin",
    "travertine": "Travertin",
    
    // Terrazzo
    "terrazzo": "Terrazzo",
    
    // Onyx
    "onyx": "Onyx",
    
    // Semi-precious
    "semiprecious": "Semi-precious",
    "semi-precious": "Semi-precious",
    "halvadel": "Semi-precious",
  };
  
  return categoryMap[lower] || cat;
}

export default function App() {
  const { t, i18n } = useTranslation();

  const [view, setView] = useState("materials");
  const [variant, setVariant] = useState(null);
  const [thicknessMm, setThicknessMm] = useState(20);

  const [presetCategory, setPresetCategory] = useState("");
  const [materials, setMaterials] = useState([]);
  const materialsIndexRef = useRef(new Map());

  const imagesMap = useImagesMap();
  const uiLang = (i18n.language || "sv").slice(0, 2);

  const currentWeek = getWeekNumber();
  const weekData = WEEKLY_MESSAGES[currentWeek];
  const weeklyMessage = weekData
    ? weekData[uiLang] || weekData.sv
    : uiLang === "sv"
      ? "Prisgaranti på alla våra stenskivor."
      : "Price match guarantee on all our stone surfaces.";

  // ✅ Scroll till toppen vid vy-byte
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const setLang = useCallback(
    (lng) => {
      const normalized = lng === "en" ? "en" : "sv";
      i18n.changeLanguage(normalized);
      try {
        localStorage.setItem("lang", normalized);
      } catch {}
      document.documentElement.lang = normalized;
    },
    [i18n]
  );

  // -------------------- CSV loader --------------------
  useEffect(() => {
    let cancelled = false;

    async function loadMaterials() {
      try {
        const base = import.meta.env.BASE_URL || "/";
        const urls = [`${base}data/materials.csv`, "/data/materials.csv"];

        let text = "";
        for (const url of urls) {
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) {
            text = await res.text();
            break;
          }
        }
        if (!text || cancelled) return;

        const rows = parseMaterialsCsv(text);
        if (cancelled) return;

        setMaterials(rows);
        buildDynamicLexicon(rows);

        // Build index: baseKey__thickness -> row
        const idx = new Map();
        for (const r of rows) {
          const baseKey = computeBaseKey(r);
          const th = toInt(r.thickness_mm);
          if (baseKey && th) idx.set(`${baseKey}__${th}`, r);
        }
        materialsIndexRef.current = idx;
      } catch (e) {
        console.error("CSV Load Error:", e);
      }
    }

    loadMaterials();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Hantera val av material (robust bildval)
  const handlePickMaterial = useCallback(
    (m) => {
      const direct = normalizeImgPath(m.image);
      const candidates = buildImageCandidates(m, imagesMap);
      const imageUrl = direct || (candidates && candidates[0]) || "/products/placeholder.jpg";

      const pickedThickness = toInt(m.thickness_mm) || 20;
      const baseKey = computeBaseKey(m);

      setThicknessMm(pickedThickness);
      setVariant({
        id: m.id || slug(m.name),
        name: m.name,
        price: Number(m.price) || 0,
        image: imageUrl,
        thicknessMm: pickedThickness,
        baseKey,
      });

      setView("calculator");
    },
    [imagesMap]
  );

  // ✅ handleThicknessChange är memoiserad och stabil
  const handleThicknessChange = useCallback(
    (nextThickness) => {
      const next = toInt(nextThickness);
      if (!next) return;

      setThicknessMm(next);

      setVariant((prev) => {
        if (!prev) return prev;

        const baseKey = prev.baseKey || computeBaseKey(prev);
        const hit = materialsIndexRef.current.get(`${baseKey}__${next}`);

        if (hit) {
          const direct = normalizeImgPath(hit.image);
          const candidates = buildImageCandidates(hit, imagesMap);
          const nextBaseKey = computeBaseKey(hit) || baseKey;

          return {
            ...prev,
            id: hit.id || prev.id,
            name: hit.name || prev.name,
            price: Number(hit.price) || 0,
            thicknessMm: next,
            image: direct || (candidates && candidates[0]) || prev.image,
            baseKey: nextBaseKey,
          };
        }

        return { ...prev, thicknessMm: next, baseKey };
      });
    },
    [imagesMap]
  );

  // ✅ Hantera URL-parametrar vid mount (ALLTID, inte bara om storage är tom)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qVariant = params.get("variant");
    const cat = params.get("cat");

    // Om det finns en kategori-parameter, använd den (prioritera över localStorage)
    if (cat) {
      const normalizedCat = normalizeCategoryFromQuery(cat);
      console.log("URL cat parameter:", cat, "-> normalized:", normalizedCat);
      
      // Rensa eventuellt gammalt state när vi kommer med kategori-parameter
      clearStorage();
      
      setPresetCategory(normalizedCat);
      setVariant(null);
      setView("materials");
      
      // Rensa URL utan att trigga refresh
      window.history.replaceState({}, "", window.location.pathname);
      return; // Avbryt här, ingen localStorage-laddning
    }

    if (qVariant) {
      const baseKey = computeBaseKey({ name: qVariant });
      setVariant({
        id: slug(qVariant),
        name: qVariant,
        price: parseNumberLoose(params.get("price")),
        image: params.get("img") || "/products/placeholder.jpg",
        thicknessMm: 20,
        baseKey,
      });
      setThicknessMm(20);
      setView("calculator");
      
      // Rensa URL utan att trigga refresh
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    // Om inga URL-parametrar, ladda från localStorage
    const stored = loadFromStorage();
    if (stored) {
      if (stored.variant) setVariant(stored.variant);
      if (stored.thicknessMm) setThicknessMm(stored.thicknessMm);
      if (stored.view) setView(stored.view);
      if (stored.presetCategory) setPresetCategory(stored.presetCategory);
    }
  }, []); // Körs bara en gång vid mount

  // ✅ Spara till localStorage när state ändras
  useEffect(() => {
    if (variant || view === "calculator") {
      saveToStorage({
        variant,
        thicknessMm,
        view,
        presetCategory,
      });
    }
  }, [variant, thicknessMm, view, presetCategory]);

  // ✅ Funktion för att rensa formulär
  const handleClearForm = useCallback(() => {
    clearStorage();
    setVariant(null);
    setThicknessMm(20);
    setPresetCategory("");
    setView("materials");
  }, []);

  // 🛡️ Robust tillgängliga tjocklekar
  const availableThicknesses = useMemo(() => {
    const baseKey = variant?.baseKey || (variant ? computeBaseKey(variant) : "");
    if (!baseKey) return [20, 30];

    const idx = materialsIndexRef.current;
    const set = new Set();
    const prefix = `${baseKey}__`;

    for (const key of idx.keys()) {
      if (key.startsWith(prefix)) {
        const th = toInt(key.split("__")[1]);
        if (th) set.add(th);
      }
    }

    const list = [...set].sort((a, b) => a - b);
    return list.length ? list : [20, 30];
  }, [variant?.baseKey, variant?.name, materials]);

  const txt = useMemo(
    () => ({
      navCalculator: t("nav.calculator", "Kalkylator"),
      navMaterials: t("nav.materials", "Material"),
      heroTitleMaterials: t("app.hero.titleMaterials", "Välj material"),
      heroTitleCalculator: t("app.hero.titleCalculator", "Kalkylator"),
      heroDescMaterials: t(
        "app.hero.descMaterials",
        "Filtrera och välj din sten. Pris per m² visas på varje material."
      ),
      heroDescCalculator: t(
        "app.hero.descCalculator",
        "Måtta, välj kantbearbetning, stänkskydd samt öppningar & tillval."
      ),
      brand: t("common.brand", "marmorskivan.se"),
      clearForm: t("calculator.clearForm", "Rensa formulär"),
    }),
    [t]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>
          {view === "materials"
            ? "Välj material – Marmorskivan"
            : `Kalkylator: ${variant?.name || ""}`}
        </title>
      </Helmet>

      <header className="bg-white/70 border-b backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <a
            href="https://marmorskivan.se"
            className="text-base sm:text-xl font-bold text-gray-900 hover:text-emerald-700 shrink-0"
          >
            {txt.brand}
          </a>

          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                className={`px-2 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition-colors ${
                  view === "calculator"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setView("calculator")}
                disabled={!variant}
              >
                {txt.navCalculator}
              </button>

              <button
                className={`px-2 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition-colors ${
                  view === "materials"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setView("materials")}
              >
                {txt.navMaterials}
              </button>

              {variant && (
                <button
                  className="px-2 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm bg-red-50 hover:bg-red-100 text-red-700"
                  onClick={handleClearForm}
                  title={txt.clearForm}
                >
                  <span className="hidden sm:inline">{txt.clearForm}</span>
                  <span className="sm:hidden">✕</span>
                </button>
              )}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold border-l pl-2 sm:pl-4 shrink-0">
              <button
                className={uiLang === "sv" ? "text-emerald-600 underline" : ""}
                onClick={() => setLang("sv")}
              >
                SV
              </button>
              <span className="text-gray-300">|</span>
              <button
                className={uiLang === "en" ? "text-emerald-600 underline" : ""}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b relative bg-gray-900">
        <div className="absolute inset-0 opacity-40 bg-[url('/hero/hero.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-900">
            {view === "materials" ? txt.heroTitleMaterials : txt.heroTitleCalculator}
          </h1>
          <p className="mt-2 text-gray-700 max-w-xl">
            {view === "materials" ? txt.heroDescMaterials : txt.heroDescCalculator}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg">
            <span className="animate-pulse">✨</span> {weeklyMessage}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "materials" ? (
          <main className="max-w-6xl mx-auto px-6 py-6 h-full">
            <MaterialPage
              onPick={handlePickMaterial}
              thicknessMm={thicknessMm}
              onThicknessChange={handleThicknessChange}
              materials={materials}
              presetCategory={presetCategory}
              key={presetCategory || "all"}
            />
          </main>
        ) : (
          <CalculatorPage
            variant={variant}
            thicknessMm={thicknessMm}
            onThicknessChange={handleThicknessChange}
            onBackToMaterials={() => setView("materials")}
            onPickMaterial={handlePickMaterial}
            availableThicknesses={availableThicknesses}
          />
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
