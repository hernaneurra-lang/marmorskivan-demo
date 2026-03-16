// src/lib/materialUtils.js

/**
 * Grundläggande normalisering för strängjämförelse.
 * Behåller . och , för att kunna tolka decimalmått korrekt.
 */
export function norm(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s.,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slug(s = "") {
  return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function tokens(s = "") {
  const n = norm(s);
  return n ? n.split(" ").filter(Boolean) : [];
}

/**
 * FINISH_WORDS - Ord som vi rensar bort för att hitta basmaterialet (Carrara Polerad -> Carrara)
 */
export const FINISH_WORDS_REGEX = /\b(polerad|polished|honed|slipad|matt|matte|glossy|leathered|borstad|brushed|silk)\b/g;

/**
 * ✅ SOURCE OF TRUTH: computeBaseKey
 */
export function computeBaseKey(m) {
  const group = norm(m?.group_id || m?.groupId || m?.base_name || m?.baseName || "");
  if (group) return group.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const source = String(
    m?.webName || m?.webname || m?.filename || m?.name || m?.namn || m?.material || ""
  ).trim();
  
  const name = norm(source).replace(/\.[a-z0-9]+$/i, ""); 
  if (!name) return "";

  return name
    .replace(/(\d+(?:[.,]\d+)?)\s*(mm|cm)/g, " ")
    .replace(FINISH_WORDS_REGEX, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

/**
 * Robust siffertolkare: Hanterar svenska format (1.234,50), enheter (cm/mm) och valutor.
 */
export function parseNumberLoose(v) {
  if (v === null || v === undefined) return 0;
  let s = String(v).trim().replace(/㎡/g, "m2").replace(/m²/gi, "m2").replace(/²/g, "2");
  if (!s) return 0;

  const cmMatch = s.match(/(\d+(?:[.,]\d+)?)\s*cm\b/i);
  if (cmMatch) return parseFloat(cmMatch[1].replace(",", ".")) * 10;

  s = s.replace(/kr|sek|€|\$|mm|\/?m2/gi, "").replace(/\s/g, "");
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasDot && !hasComma && /^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  if (hasComma && hasDot) {
    s = s.lastIndexOf(",") > s.lastIndexOf(".") 
      ? s.replace(/\./g, "").replace(",", ".") 
      : s.replace(/,/g, "");
  } else if (hasComma && !hasDot) {
    s = s.replace(",", ".");
  }

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export function toInt(v) {
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const n = Number(s.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function normalizeImgPath(p) {
  let s = String(p ?? "").trim();
  if (!s || /^(https?:\/\/|data:)/i.test(s)) return s || "";
  s = s.replace(/\\/g, "/");
  if (s.startsWith("./")) s = s.slice(2);
  const finalPath = !s.includes("/") 
    ? `/materials/${s.replace(/^\/+/, "")}` 
    : (s.startsWith("/") ? s : `/${s}`);
  return finalPath.replace(/\/+/g, "/");
}

export function parseDelimitedTable(text) {
  const s = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const head = s.slice(0, 8192);
  const counts = {
    ";": (head.match(/;/g) || []).length,
    ",": (head.match(/,/g) || []).length,
    "\t": (head.match(/\t/g) || []).length,
  };
  const sep = Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b, ";");

  const rows = [];
  let row = [], cur = "", inQ = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"') {
      if (inQ && s[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
      continue;
    }
    if (ch === sep && !inQ) { row.push(cur); cur = ""; continue; }
    if (ch === "\n" && !inQ) { row.push(cur); rows.push(row); row = []; cur = ""; continue; }
    cur += ch;
  }
  row.push(cur); rows.push(row);
  return rows.map(r => r.map(c => c.trim())).filter(r => r.some(c => c.length > 0));
}

export function normalizeMaterialRow(obj) {
  const out = { ...obj };
  const wf = out.webName || out.webname || out.webFilename || out.filename || out.web_file || out["web name"];
  out.webName = String(wf ?? "").trim();
  const webNoExt = out.webName ? out.webName.replace(/\.[a-z0-9]+$/i, "").trim() : "";
  
  out.name = webNoExt || String(out.name || out.namn || out.material || "").trim();
  out.category = String(out.category || out.kategori || out.typ || "").trim();
  
  const img = out.image || out.img || out.imageUrl || out.bild || out["image link"];
  out.image = normalizeImgPath(img);
  out.price = parseNumberLoose(out.price);
  out.thickness_mm = parseNumberLoose(out.thickness_mm || out.thickness || out.thicknessMm);
  
  if (out.thickness_mm > 0 && out.thickness_mm <= 6) out.thickness_mm *= 10;
  if (!out.id) out.id = webNoExt || slug(out.name);
  
  return out;
}

export function parseMaterialsCsv(csvText = "") {
  const table = parseDelimitedTable(csvText);
  if (!table.length) return [];

  const first = table[0];
  const looksLikeHeader = first.some(h => 
    /^(name|namn|category|kategori|thickness|tjocklek|price|pris)/i.test(String(h || "").trim())
  );

  const rows = [];
  if (looksLikeHeader) {
    const header = first.map(h => String(h || "").trim());
    for (let i = 1; i < table.length; i++) {
      const obj = {};
      for (let c = 0; c < header.length; c++) obj[header[c]] = table[i][c] ?? "";
      rows.push(normalizeMaterialRow(obj));
    }
  } else {
    const firstRowHasThickness = parseNumberLoose(table[0][3]) > 0;
    const firstRowHasPrice = parseNumberLoose(table[0][4]) > 0;
    const startIndex = (firstRowHasThickness || firstRowHasPrice) ? 0 : 1;

    for (let i = startIndex; i < table.length; i++) {
      const r = table[i];
      const webRaw = String(r[10] ?? "").trim();
      const webNoExt = webRaw.replace(/\.[a-z0-9]+$/i, "");
      
      rows.push(normalizeMaterialRow({
        webName: webRaw,
        name: (webNoExt || String(r[1] ?? "")).trim(),
        category: String(r[2] ?? "").trim(),
        thickness_mm: r[3] ?? "",
        price: r[4] ?? "",
        image: r[6] ?? "",
        description: r[9] ?? ""
      }));
    }
  }

  return rows
    .filter(r => r.name)
    .filter(r => r.thickness_mm || r.category || r.price || r.image);
}

export function normalizeCategoryFromQuery(cat = "") {
  const k = slug(cat);
  const map = {
    marmor: "Marmor", marble: "Marmor",
    granit: "Granit", granite: "Granit",
    keramik: "Keramik", ceramic: "Keramik", dekton: "Keramik", neolith: "Keramik",
    komposit: "Kvarts/komposit", composite: "Kvarts/komposit", kvarts: "Kvarts/komposit", silestone: "Kvarts/komposit",
    kalksten: "Kalksten", limestone: "Kalksten",
    travertin: "Travertin", travertine: "Travertin",
    terrazzo: "Terrazzo", kvartsit: "Kvartsit", quartzite: "Kvartsit",
    onyx: "Onyx", "semi-precious": "Semi Precious", semiprecious: "Semi Precious",
    translucent: "Kvartsit (Translucent)"
  };
  return map[k] || cat;
}