// Path: src/components/MaterialPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/* ===== Helpers ===== */
const slug = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const unique = (arr) => [...new Set(arr.filter(Boolean))];

function norm(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ✅ Stor synonymbank (färger + mönster + finish + stilord)
 * Nycklar och värden normaliseras via norm() i expandQueryTerms.
 */
const SYNONYMS = {
  svart: ["svart", "black", "nero", "noir", "anthracite", "antracit", "charcoal", "graphite", "grafit", "ebony", "jet"],
  black: ["svart", "black", "nero", "noir", "anthracite", "antracit", "charcoal", "graphite", "grafit", "ebony", "jet"],
  nero: ["svart", "black", "nero", "noir", "anthracite", "antracit", "charcoal", "graphite", "grafit", "ebony", "jet"],

  vit: ["vit", "white", "bianco", "ivory", "elfenben", "cream", "creme", "offwhite", "off white", "milk", "latte", "snow", "alabaster", "porcelain"],
  white: ["vit", "white", "bianco", "ivory", "elfenben", "cream", "creme", "offwhite", "off white", "milk", "latte", "snow", "alabaster", "porcelain"],
  bianco: ["vit", "white", "bianco", "ivory", "elfenben", "cream", "creme", "offwhite", "off white", "milk", "latte", "snow", "alabaster", "porcelain"],

  gra: ["grå", "gra", "grey", "gray", "grigio", "anthracite", "antracit", "cement", "betong", "concrete", "ash", "smoke", "slate", "stone"],
  grå: ["grå", "gra", "grey", "gray", "grigio", "anthracite", "antracit", "cement", "betong", "concrete", "ash", "smoke", "slate", "stone"],
  grey: ["grå", "gra", "grey", "gray", "grigio", "anthracite", "antracit", "cement", "betong", "concrete", "ash", "smoke", "slate", "stone"],
  gray: ["grå", "gra", "grey", "gray", "grigio", "anthracite", "antracit", "cement", "betong", "concrete", "ash", "smoke", "slate", "stone"],
  grigio: ["grå", "gra", "grey", "gray", "grigio", "anthracite", "antracit", "slate"],

  rod: ["röd", "rod", "red", "rosso", "burgundy", "bordeaux", "wine", "ruby", "scarlet", "crimson", "maroon", "garnet"],
  röd: ["röd", "rod", "red", "rosso", "burgundy", "bordeaux", "wine", "ruby", "scarlet", "crimson", "maroon", "garnet"],
  red: ["röd", "rod", "red", "rosso", "burgundy", "bordeaux", "wine", "ruby", "scarlet", "crimson", "maroon", "garnet"],
  rosso: ["röd", "rod", "red", "rosso", "burgundy", "bordeaux", "wine", "ruby", "scarlet", "crimson", "maroon", "garnet"],

  bla: ["blå", "bla", "blue", "blu", "azzurro", "navy", "indigo", "cobalt", "sapphire", "ocean", "sky", "teal"],
  blå: ["blå", "bla", "blue", "blu", "azzurro", "navy", "indigo", "cobalt", "sapphire", "ocean", "sky", "teal"],
  blue: ["blå", "bla", "blue", "blu", "azzurro", "navy", "indigo", "cobalt", "sapphire", "ocean", "sky", "teal"],
  blu: ["blå", "bla", "blue", "blu", "azzurro", "navy", "indigo", "cobalt", "sapphire", "ocean", "sky", "teal"],
  azzurro: ["blå", "bla", "blue", "blu", "azzurro", "navy", "indigo", "cobalt", "sapphire"],

  gron: ["grön", "gron", "green", "verde", "emerald", "forest", "olive", "sage", "mint", "jade", "malachite", "pistachio"],
  grön: ["grön", "gron", "green", "verde", "emerald", "forest", "olive", "sage", "mint", "jade", "malachite", "pistachio"],
  green: ["grön", "gron", "green", "verde", "emerald", "forest", "olive", "sage", "mint", "jade", "malachite", "pistachio"],
  verde: ["grön", "gron", "green", "verde", "emerald", "forest", "olive", "sage", "mint", "jade", "malachite", "pistachio"],

  gul: ["gul", "yellow", "giallo", "golden", "mustard", "ochre", "ocra", "lemon", "honey", "saffron"],
  yellow: ["gul", "yellow", "giallo", "golden", "mustard", "ochre", "ocra", "lemon", "honey", "saffron"],
  giallo: ["gul", "yellow", "giallo", "golden", "mustard", "ochre", "ocra", "lemon", "honey", "saffron"],

  orange: ["orange", "arancione", "amber", "tangerine", "apricot", "copper", "rust"],
  arancione: ["orange", "arancione", "amber", "tangerine", "apricot", "copper", "rust"],

  rosa: ["rosa", "pink", "rose", "rosé", "blush", "fuchsia", "magenta", "salmon", "coral"],
  pink: ["rosa", "pink", "rose", "rosé", "blush", "fuchsia", "magenta", "salmon", "coral"],
  rose: ["rosa", "pink", "rose", "rosé", "blush", "fuchsia", "magenta", "salmon", "coral"],

  lila: ["lila", "purple", "violet", "viola", "lavender", "plum", "aubergine", "amethyst"],
  purple: ["lila", "purple", "violet", "viola", "lavender", "plum", "aubergine", "amethyst"],
  violet: ["lila", "purple", "violet", "viola", "lavender", "plum", "aubergine", "amethyst"],
  viola: ["lila", "purple", "violet", "viola", "lavender", "plum", "aubergine", "amethyst"],

  brun: ["brun", "brown", "marrone", "tan", "chocolate", "mocha", "cognac", "walnut", "hazelnut", "coffee", "espresso"],
  brown: ["brun", "brown", "marrone", "tan", "chocolate", "mocha", "cognac", "walnut", "hazelnut", "coffee", "espresso"],
  marrone: ["brun", "brown", "marrone", "tan", "chocolate", "mocha", "cognac", "walnut", "hazelnut", "coffee", "espresso"],
  tan: ["brun", "brown", "marrone", "tan", "chocolate", "mocha", "cognac", "walnut"],

  beige: ["beige", "sand", "sandy", "ecru", "taupe", "tortora", "cream", "creme", "ivory", "greige", "linen"],
  sand: ["beige", "sand", "sandy", "ecru", "taupe", "tortora", "greige", "linen"],
  taupe: ["beige", "taupe", "tortora", "greige", "sand", "stone"],
  tortora: ["beige", "taupe", "tortora", "greige", "sand", "stone"],
  greige: ["greige", "taupe", "beige", "gray", "grey", "sand"],

  guld: ["guld", "gold", "oro", "golden", "champagne", "brass", "bronze"],
  gold: ["guld", "gold", "oro", "golden", "champagne", "brass", "bronze"],
  oro: ["guld", "gold", "oro", "golden", "champagne", "brass", "bronze"],

  silver: ["silver", "argento", "chrome", "krom", "steel", "stainless", "metallic", "metall", "platinum"],
  argento: ["silver", "argento", "chrome", "krom", "steel", "stainless", "metallic", "metall", "platinum"],
  krom: ["silver", "argento", "chrome", "krom", "steel", "stainless", "metallic", "metall", "platinum"],
  metallic: ["metallic", "metall", "silver", "gold", "bronze", "copper", "steel"],

  koppar: ["koppar", "copper", "rame", "bronze", "brass", "rust"],
  copper: ["koppar", "copper", "rame", "bronze", "brass", "rust"],
  rame: ["koppar", "copper", "rame", "bronze", "brass", "rust"],

  turkos: ["turkos", "turquoise", "teal", "aqua", "cyan", "lagoon"],
  turquoise: ["turkos", "turquoise", "teal", "aqua", "cyan", "lagoon"],
  teal: ["turkos", "turquoise", "teal", "aqua", "cyan", "lagoon"],
  aqua: ["turkos", "turquoise", "teal", "aqua", "cyan", "lagoon"],

  mönster: ["mönster", "pattern", "texture", "struktur", "look", "utseende"],
  pattern: ["mönster", "pattern", "texture", "struktur", "look", "utseende"],

  marmorerad: ["marmorerad", "marbled", "marble", "marmor", "veined", "veining", "ådring", "calacatta", "statuario", "carrara"],
  marbled: ["marmorerad", "marbled", "marble", "marmor", "veined", "veining", "ådring", "calacatta", "statuario", "carrara"],
  marmorering: ["marmorering", "marmorerad", "marbled", "veined", "ådring", "veining"],

  ådring: ["ådring", "vein", "veins", "veined", "veining", "striated", "linear", "bookmatch", "bookmatched"],
  veined: ["ådring", "vein", "veins", "veined", "veining", "striated", "linear", "bookmatch", "bookmatched"],
  vein: ["ådring", "vein", "veins", "veined", "veining", "striated", "linear", "bookmatch", "bookmatched"],

  fläckig: ["fläckig", "speckled", "freckled", "salt", "pepper", "saltpepper", "salt and pepper", "granit", "granite"],
  speckled: ["fläckig", "speckled", "freckled", "salt", "pepper", "saltpepper", "salt and pepper"],

  terrazzo: ["terrazzo", "chips", "chipped", "confetti", "granules", "korn", "fragment", "mosaik"],
  betong: ["betong", "cement", "concrete", "industrial", "urban", "loft", "stone"],

  trälook: ["trä", "tra", "wood", "woodlook", "wood look", "timber", "oak", "walnut", "ash"],
  wood: ["trä", "tra", "wood", "woodlook", "wood look", "timber", "oak", "walnut", "ash"],

  enfärgad: ["enfärgad", "enfargad", "solid", "plain", "uniform", "monochrome", "monokrom"],
  solid: ["enfärgad", "enfargad", "solid", "plain", "uniform", "monochrome", "monokrom"],

  skimrande: ["skimrande", "shimmer", "sparkle", "glitter", "crystal", "crystalline", "mica", "metallisk"],
  glitter: ["skimrande", "shimmer", "sparkle", "glitter", "crystal", "crystalline", "mica"],

  translucent: ["translucent", "backlit", "bakbelyst", "onyx", "alabaster", "semitransparent", "semi transparent"],
  bakbelyst: ["translucent", "backlit", "bakbelyst", "onyx", "alabaster", "semitransparent"],

  polerad: ["polerad", "polished", "glossy", "highgloss", "high gloss", "mirror", "shiny"],
  polished: ["polerad", "polished", "glossy", "highgloss", "high gloss", "mirror", "shiny"],

  matt: ["matt", "matte", "honed", "silk", "satin", "soft"],
  matte: ["matt", "matte", "honed", "silk", "satin", "soft"],
  honed: ["matt", "matte", "honed", "silk", "satin", "soft"],

  leathered: ["leathered", "läder", "lader", "textured", "brushed", "antik", "antique"],
  brushed: ["brushed", "borstad", "textured", "leathered", "antik", "antique"],

  flammig: ["flammig", "flamed", "thermal", "rough", "slipresistant", "anti slip", "antislip"],
  flamed: ["flammig", "flamed", "thermal", "rough", "slipresistant", "anti slip", "antislip"],

  sandblästrad: ["sandblästrad", "sandblasted", "blasted", "rough", "textured"],
  sandblasted: ["sandblästrad", "sandblasted", "blasted", "rough", "textured"],

  calacatta: ["calacatta", "gold", "oro", "macchia", "veins", "veined", "statuario", "marble look", "marmorlook"],
  carrara: ["carrara", "bianco", "white", "grey", "gray", "veins", "veined", "marble", "marmor"],
  statuario: ["statuario", "white", "bianco", "veins", "veined", "luxury", "marble", "marmor"],
  onyx: ["onyx", "translucent", "backlit", "bakbelyst", "veins", "dramatic", "luxury"],
  travertin: ["travertin", "travertine", "beige", "creme", "honed", "filled", "natural", "rustic"],
  travertine: ["travertin", "travertine", "beige", "creme", "honed", "filled", "natural", "rustic"],
};

function expandQueryTerms(query) {
  const q = norm(query);
  if (!q) return [];
  const tokens = q.split(" ").filter(Boolean);
  const set = new Set();
  for (const tok of tokens) {
    const list = SYNONYMS[tok] || [tok];
    for (const v of list) set.add(norm(v));
  }
  set.add(q);
  return [...set].filter((x) => x.length >= 2);
}

function categoryKey(raw = "") {
  const s = String(raw).trim();
  const map = {
    Kompositsten: "compositeStone",
    Granit: "granite",
    Keramik: "ceramic",
    Kalksten: "limestone",
    Marmor: "marble",
    Terrazzo: "terrazzo",
    Kvartsit: "quartzite",
    "Semi Precious": "semiPrecious",
    "Kvartsit (Translucent)": "quartziteTranslucent",
    Onyx: "onyx",
    Travertin: "travertine",
  };
  return map[s] || "";
}

/* ===== Optional images map loader (public/data/images-map.json) ===== */
function useImagesMap() {
  const [map, setMap] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const base = import.meta.env.BASE_URL || "/";
        const res = await fetch(`${base}data/images-map.json`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (alive) setMap(json || {});
        } else {
          if (alive) setMap({});
        }
      } catch {
        setMap({});
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  return map;
}

/* ===== Image with fallback ===== */
function ImageWithFallback({ candidates = [], alt = "", className = "", onClick }) {
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const src = candidates[idx] || "/products/placeholder.jpg";

  useEffect(() => {
    setIdx(0);
    setFailed(false);
  }, [JSON.stringify(candidates)]);

  return (
    <img
      src={failed ? "/products/placeholder.jpg" : src}
      alt={alt}
      className={className}
      loading="lazy"
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(e);
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onError={() => {
        if (idx < candidates.length - 1) setIdx(idx + 1);
        else setFailed(true);
      }}
    />
  );
}

/* ===== CSV parser (supports newlines inside quotes) ===== */
function stripBOM(s = "") {
  return String(s || "").replace(/^\uFEFF/, "");
}

function detectSeparatorFromFirstRecord(text = "") {
  const s = stripBOM(String(text || ""));
  let inQ = false;
  let rec = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"') {
      if (inQ && s[i + 1] === '"') {
        rec += '"';
        i++;
      } else {
        inQ = !inQ;
      }
      continue;
    }
    if (!inQ && (ch === "\n" || ch === "\r")) break;
    rec += ch;
  }
  const semi = (rec.match(/;/g) || []).length;
  const comma = (rec.match(/,/g) || []).length;
  if (semi === 0 && comma === 0) return ",";
  return semi >= comma ? ";" : ",";
}

function parseCSV(text = "") {
  const s = stripBOM(String(text || ""));
  const sep = detectSeparatorFromFirstRecord(s);

  const rows = [];
  let row = [];
  let cur = "";
  let inQ = false;

  const pushField = () => {
    row.push(String(cur ?? "").trim());
    cur = "";
  };

  const pushRow = () => {
    if (row.length === 1 && String(row[0] || "").trim() === "") {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (ch === '"') {
      if (inQ && s[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
      continue;
    }

    if (!inQ && ch === sep) {
      pushField();
      continue;
    }

    if (!inQ && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      pushField();
      pushRow();
      continue;
    }

    cur += ch;
  }

  if (cur.length || row.length) {
    pushField();
    pushRow();
  }

  if (!rows.length) return [];

  const header = rows[0].map((h) => String(h || "").trim());
  const out = [];

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    if (!cols || !cols.length) continue;

    const obj = {};
    for (let c = 0; c < header.length; c++) obj[header[c]] = cols[c] ?? "";

    obj.id = String(obj.id ?? "").trim();
    obj.name = String(obj.name ?? "").trim();
    obj.category = String(obj.category ?? "").trim();
    obj.description = String(obj.description ?? "").trim();

    const th = Number(String(obj.thickness_mm ?? "").replace(/[^\d.]/g, "")) || 0;
    obj.thickness_mm = th || "";

    let prS = String(obj.price ?? "").trim().replace(/\s/g, "");
    if (/^\d{1,3}(\.\d{3})+$/.test(prS)) prS = prS.replace(/\./g, "");
    prS = prS.replace(",", ".");
    const pr = Number(prS);
    obj.price = Number.isFinite(pr) ? pr : "";

    if ("image" in obj) obj.image = String(obj.image || "").trim();

    out.push(obj);
  }

  return out;
}

/* ===== Image candidates for base name ===== */
function buildImageCandidatesForBase(baseName, imagesMap) {
  const list = [];
  const key = slug(baseName);
  if (imagesMap && imagesMap[key]) list.push(imagesMap[key]);

  const exts = ["jpg"];
  const name1 = baseName.replace(/\s+/g, "_");
  exts.forEach((ext) => list.push(`/materials/${name1}.${ext}`));

  const name2 = baseName
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  exts.forEach((ext) => list.push(`/materials/${name2}.${ext}`));

  exts.forEach((ext) => list.push(`/materials/${slug(baseName)}.${ext}`));

  return list.filter(Boolean);
}

/* ===== Normalize CSV row ===== */
function normalizeRow(r) {
  let baseName = String(r.name || "").replace(/\(\s*\d+\s*mm\s*\)\s*$/i, "").trim();
  baseName = baseName.replace(/\s+\d+\s*mm$/i, "").trim();
  return { ...r, baseName };
}

/* ===== Prefer priced row if duplicate thickness ===== */
function pickBetterItem(a, b) {
  const ap = Number(a?.price) || 0;
  const bp = Number(b?.price) || 0;
  if (ap > 0 && bp <= 0) return a;
  if (bp > 0 && ap <= 0) return b;
  return a;
}

/* ===== Group by base material (dedupe thickness) ===== */
function groupByBase(rows) {
  const groups = new Map();

  for (const r0 of rows) {
    const r = normalizeRow(r0);
    if (!r.baseName) continue;

    const key = r.baseName;
    if (!groups.has(key)) {
      groups.set(key, {
        baseName: key,
        category: r.category || "",
        description: r.description || r.desc || "",
        _byThickness: new Map(),
      });
    }

    const g = groups.get(key);
    const th = Number(r.thickness_mm) || 0;
    const thKey = th > 0 ? String(th) : "__unknown__";

    const candidate = {
      thickness_mm: th || "",
      price: Number(r.price) || 0,
      row: r,
    };

    if (!g._byThickness.has(thKey)) g._byThickness.set(thKey, candidate);
    else g._byThickness.set(thKey, pickBetterItem(g._byThickness.get(thKey), candidate));
  }

  const out = [];
  for (const g of groups.values()) {
    const items = [...g._byThickness.values()].sort(
      (a, b) => (Number(a.thickness_mm) || 0) - (Number(b.thickness_mm) || 0)
    );

    const priced = items.filter((it) => (Number(it.price) || 0) > 0);
    const hasAnyPrice = priced.length > 0;
    const cheapestPrice = hasAnyPrice ? Math.min(...priced.map((it) => Number(it.price) || 0)) : 0;

    // ✅ “profil” = någon variant i spannet 3500–5000
    const hasProfilePrice = priced.some((it) => {
      const p = Number(it.price) || 0;
      return p >= 3500 && p <= 5000;
    });

    // ✅ för sort: hur nära mitten i spannet (4250) är närmaste pris?
    const target = 4250;
    const profileDist = hasAnyPrice
      ? Math.min(...priced.map((it) => Math.abs((Number(it.price) || 0) - target)))
      : 999999;

    out.push({
      baseName: g.baseName,
      category: g.category,
      description: g.description,
      items,
      _hasAnyPrice: hasAnyPrice,
      _cheapestPrice: cheapestPrice,
      _hasProfilePrice: hasProfilePrice,
      _profileDist: profileDist,
    });
  }

  return out;
}

/**
 * ✅ Token-set för smartquery (inkl ALLA fält i row: color/pattern/etc)
 */
function buildGroupTokens(g) {
  const parts = [];
  parts.push(g.baseName, g.category, g.description);

  for (const it of g.items || []) {
    parts.push(String(it.thickness_mm || ""));
    const row = it.row || {};
    for (const k of Object.keys(row)) {
      const v = row[k];
      if (v === null || v === undefined) continue;
      if (typeof v === "object") continue;
      parts.push(String(v));
    }
  }

  const all = norm(parts.filter(Boolean).join(" "));
  return new Set(all.split(" ").filter(Boolean));
}

/* ===== Modal ===== */
function Modal({ open, onClose, children, labelledBy }) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" aria-labelledby={labelledBy} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto p-4 sm:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-xl border">
          <div className="flex items-center justify-between gap-4 p-4 border-b">
            <h3 id={labelledBy} className="text-lg font-semibold">
              {t("materialsPage.modalTitle", { defaultValue: "Mer info" })}
            </h3>
            <button
              className="rounded-xl border px-3 py-1.5 hover:bg-gray-50"
              onClick={onClose}
              aria-label={t("materialsPage.closeAria", { defaultValue: "Stäng" })}
            >
              {t("materialsPage.close", { defaultValue: "Stäng" })}
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ===== Main component ===== */
export default function MaterialPage({ onPick, presetCategory, materials = [] }) {
  const { t, i18n } = useTranslation();

  const currency = (n) =>
    (isNaN(n) ? 0 : n).toLocaleString(i18n.language || "sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    });

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoGroup, setInfoGroup] = useState(null);

  const imagesMap = useImagesMap();

  // ✅ Använd props.materials om de finns, annars fallback-ladda csv (bakåtkompatibelt)
  useEffect(() => {
    if (Array.isArray(materials) && materials.length > 0) {
      setRows(materials);
      setLoading(false);
      setError("");
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        const base = import.meta.env.BASE_URL || "/";
        const bust = `v=${Date.now()}`;
        const res = await fetch(`${base}data/materials.csv?${bust}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} vid hämtning av /data/materials.csv`);
        const text = await res.text();

        const parsed = parseCSV(text);
        if (!alive) return;
        setRows(parsed);
      } catch (e) {
        console.error("materials.csv load failed:", e);
        setError(String(e?.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [materials]);

  const groups = useMemo(() => groupByBase(rows), [rows]);

  const categories = useMemo(() => {
    const cats = unique(groups.map((g) => g.category));
    return ["all", ...cats];
  }, [groups]);

  useEffect(() => {
    if (!presetCategory) return;
    const wanted = String(presetCategory).trim().toLowerCase();
    if (!wanted) return;
    const match =
      categories.find((c) => c !== "all" && String(c).trim().toLowerCase() === wanted) || null;
    if (match) setCategory(match);
  }, [presetCategory, categories]);

  const groupsWithTokens = useMemo(() => {
    return groups.map((g) => ({
      ...g,
      _tokens: buildGroupTokens(g),
      _phrase: norm([g.baseName, g.category, g.description].filter(Boolean).join(" ")),
    }));
  }, [groups]);

  const filtered = useMemo(() => {
    let list = groupsWithTokens;

    if (category !== "all") list = list.filter((g) => g.category === category);

    const qRaw = q.trim();
    if (qRaw) {
      const terms = expandQueryTerms(qRaw);
      const qNorm = norm(qRaw);

      list = list.filter((g) => {
        const tokens = g._tokens;

        if (terms.some((term) => tokens.has(term))) return true;
        if (qNorm && g._phrase.includes(qNorm)) return true;
        if (g.baseName && norm(g.baseName).includes(qNorm)) return true;

        if (qNorm.length >= 2) {
          for (const tok of tokens) {
            if (tok.startsWith(qNorm)) return true;
          }
        }

        return false;
      });
    }

    return list;
  }, [groupsWithTokens, category, q]);

  // ✅ SORT:
  // 1) profil-priser (3500–5000) först
  // 2) övriga prissatta
  // 3) oprissatta sist
  // inom varje: närmast mitten (4250) först, sen billigast, sen alfabetiskt
  const sortedFiltered = useMemo(() => {
    const list = [...(filtered || [])];

    list.sort((a, b) => {
      const aProfile = !!a._hasProfilePrice;
      const bProfile = !!b._hasProfilePrice;
      if (aProfile !== bProfile) return aProfile ? -1 : 1;

      const aHas = !!a._hasAnyPrice;
      const bHas = !!b._hasAnyPrice;
      if (aHas !== bHas) return aHas ? -1 : 1;

      // båda har pris: närmast 4250 först (för att "profilera" spannet)
      if (aHas && bHas) {
        const ad = Number(a._profileDist) || 999999;
        const bd = Number(b._profileDist) || 999999;
        if (ad !== bd) return ad - bd;

        const ap = Number(a._cheapestPrice) || 0;
        const bp = Number(b._cheapestPrice) || 0;
        if (ap !== bp) return ap - bp;
      }

      return String(a.baseName || "").localeCompare(String(b.baseName || ""), "sv");
    });

    return list;
  }, [filtered]);

  const filteredRowCount = useMemo(() => {
    return (sortedFiltered || []).reduce((sum, g) => sum + (g.items?.length || 0), 0);
  }, [sortedFiltered]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border overflow-hidden">
        <div
          className="relative p-6"
          style={{
            backgroundImage: `url(/hero/hero.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/85" />
          <div className="relative">
            <h1 className="text-2xl font-semibold">{t("materialsPage.title", { defaultValue: "Material" })}</h1>
            <p className="text-sm text-gray-700">
              {t("materialsPage.subtitle", { defaultValue: "Välj sten och tjocklek för att fortsätta." })}
            </p>

            {error && (
              <div className="mt-3 text-sm text-red-600">
                {t("materialsPage.csvErrorPrefix", { defaultValue: "Kunde inte läsa materials.csv:" })} {error}
              </div>
            )}

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("materialsPage.searchPlaceholder", {
                  defaultValue: "Sök… (namn, färg, mönster, finish, tjocklek)",
                })}
                className="w-full rounded-xl border px-3 py-2 bg-white"
              />

              <select
                className="rounded-xl border px-3 py-2 bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => {
                  if (c === "all") {
                    return (
                      <option key={c} value={c}>
                        {t("materialsPage.filterAll", { defaultValue: "Alla" })}
                      </option>
                    );
                  }

                  const key = categoryKey(c);
                  const label = key ? t(`materials.categories.${key}`, { defaultValue: c }) : c;

                  return (
                    <option key={c} value={c}>
                      {label}
                    </option>
                  );
                })}
              </select>

              <div className="rounded-xl border px-3 py-2 bg-white text-sm text-gray-600 flex items-center">
                {t("materialsPage.showingRows", {
                  count: filteredRowCount,
                  defaultValue: `Visar ${filteredRowCount} rader`,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-6">
          {t("materialsPage.loading", { defaultValue: "Laddar material…" })}
        </div>
      ) : (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedFiltered.map((g) => (
            <MaterialGroupCard
              key={g.baseName}
              group={g}
              imagesMap={imagesMap}
              onPick={onPick}
              onOpenInfo={(group) => {
                setInfoGroup(group);
                setInfoOpen(true);
              }}
              currency={currency}
            />
          ))}

          {sortedFiltered.length === 0 && (
            <div className="col-span-full rounded-2xl border bg-white p-6 text-gray-600">
              {t("materialsPage.noResults", { defaultValue: "Inga material matchade din sökning." })}
            </div>
          )}
        </section>
      )}

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} labelledBy="material-info-title">
        {infoGroup && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden border">
                <ImageWithFallback
                  candidates={buildImageCandidatesForBase(infoGroup.baseName, imagesMap)}
                  alt={infoGroup.baseName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 id="material-info-title" className="text-xl font-semibold">
                {infoGroup.baseName}
              </h4>

              <div className="text-sm text-gray-600">
                {(() => {
                  const k = categoryKey(infoGroup.category);
                  return k
                    ? t(`materials.categories.${k}`, { defaultValue: infoGroup.category })
                    : infoGroup.category || "—";
                })()}
              </div>

              {infoGroup.description && (
                <p className="text-sm text-gray-700 whitespace-pre-line">{infoGroup.description}</p>
              )}

              <div className="border rounded-xl divide-y">
                {infoGroup.items.map((it, i) => (
                  <div key={i} className="p-3 flex items-center justify-between gap-4">
                    <div className="text-sm">{it.thickness_mm ? `${it.thickness_mm} mm` : "—"}</div>
                    <div className="text-sm font-medium">
                      {it.price
                        ? `${currency(it.price)} / m²`
                        : t("materialsPage.priceOnRequest", { defaultValue: "Pris lämnas vid förfrågan" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ===== Card per base material ===== */
function MaterialGroupCard({ group, imagesMap, onPick, onOpenInfo, currency }) {
  const { t } = useTranslation();
  const { baseName, category, items } = group;

  // ✅ default-tjocklek: första prissatta (om någon), annars första
  const preferredIdx = useMemo(() => {
    const idx = (items || []).findIndex((it) => (Number(it.price) || 0) > 0);
    return idx >= 0 ? idx : 0;
  }, [items]);

  const [selIdx, setSelIdx] = useState(preferredIdx);

  useEffect(() => {
    setSelIdx(preferredIdx);
  }, [preferredIdx]);

  const sel = items[selIdx] || items[0] || {};
  const candidates = buildImageCandidatesForBase(baseName, imagesMap);

  const price = Number(sel.price) || 0;

  const handlePick = () => {
    onPick?.({
      id: slug(`${baseName}-${sel.thickness_mm || ""}`),
      name: `${baseName}${sel.thickness_mm ? ` (${sel.thickness_mm} mm)` : ""}`,
      price: price || 0,
      image: candidates[0] || "/products/placeholder.jpg",
      thickness_mm: sel.thickness_mm || "",
      category,
    });
  };

  const openInfo = () => onOpenInfo?.(group);

  const categoryLabel = useMemo(() => {
    const k = categoryKey(category);
    return k ? t(`materials.categories.${k}`, { defaultValue: category }) : category || "—";
  }, [category, t]);

  return (
    <article className="rounded-2xl border bg-white overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-gray-100 relative group cursor-zoom-in" onClick={openInfo}>
        <ImageWithFallback
          candidates={candidates}
          alt={baseName}
          onClick={openInfo}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
        />
        <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded-lg bg-black/60 text-white">
          {t("materialsPage.clickToEnlarge", { defaultValue: "Klicka för större bild" })}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="text-xs text-gray-500">{categoryLabel}</div>
        <h3 className="font-semibold">{baseName}</h3>

        <label className="text-sm">
          <span className="text-gray-600">
            {t("materialsPage.thickness", { defaultValue: "Tjocklek:" })}{" "}
          </span>
          <select
            className="ml-2 rounded-lg border px-2 py-1 bg-white"
            value={selIdx}
            onChange={(e) => setSelIdx(Number(e.target.value) || 0)}
          >
            {items.map((it, i) => {
              const p = Number(it.price) || 0;
              const label = it.thickness_mm ? `${it.thickness_mm} mm` : "—";
              return (
                <option key={i} value={i}>
                  {p > 0 ? `${label} • ${currency(p)}/m²` : label}
                </option>
              );
            })}
          </select>
        </label>

        <div className="text-sm text-gray-700 mt-1">
          {price
            ? `${currency(price)} / m²`
            : t("materialsPage.priceOnRequest", { defaultValue: "Pris lämnas vid förfrågan" })}
        </div>

        <div className="mt-auto pt-2 flex gap-2">
          <button
            className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
            onClick={handlePick}
            title={t("materialsPage.chooseTitle", { defaultValue: "Välj material" })}
          >
            {t("materialsPage.choose", { defaultValue: "Välj" })}
          </button>

          <button
            className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
            onClick={openInfo}
            title={t("materialsPage.moreInfoTitle", { defaultValue: "Mer info" })}
          >
            {t("materialsPage.moreInfo", { defaultValue: "Mer info" })}
          </button>
        </div>
      </div>
    </article>
  );
}
