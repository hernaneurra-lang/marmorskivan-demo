// Path: src/utils/parseCSV.js

/**
 * Robust CSV parser for materials.csv
 * - Auto-detects separator: ";" or ","
 * - Supports quoted fields + escaped quotes ("")
 * - Handles BOM
 * - Parses numeric fields like: "12 900 kr/m²", "12.900", "12900", "30 mm", "3 cm" -> numbers
 * - Keeps all columns, only normalizes common ones if present
 */

function stripBOM(s = "") {
  return String(s || "").replace(/^\uFEFF/, "");
}

function normalizeSuperscripts(s = "") {
  return String(s)
    .replace(/㎡/g, "m2")
    .replace(/m²/gi, "m2")
    .replace(/²/g, "2");
}

/**
 * Parses numbers from messy strings:
 * - "12 900 kr/m²" -> 12900
 * - "12.900" -> 12900
 * - "1.234,56" -> 1234.56
 * - "30 mm" -> 30
 * - "3 cm" -> 30 (mm)
 */
function parseNumberLoose(v) {
  if (v === null || v === undefined) return "";
  let s = String(v).trim();
  if (!s) return "";

  s = normalizeSuperscripts(s);

  // cm -> mm
  const cmMatch = s.match(/(\d+(?:[.,]\d+)?)\s*cm\b/i);
  if (cmMatch) {
    const raw = cmMatch[1].replace(",", ".");
    const n = Number(raw);
    return Number.isFinite(n) ? n * 10 : "";
  }

  // remove currency + common units
  s = s.replace(/kr|sek|€|\$/gi, "").trim();
  s = s.replace(/\s/g, "");
  s = s.replace(/\/?m2$/i, "");
  s = s.replace(/\/m2/i, "");
  s = s.replace(/mm$/i, "");

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  // "12.900" -> 12900
  if (hasDot && !hasComma && /^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }

  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      // 1.234,56 -> 1234.56
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // 1,234.56 -> 1234.56
      s = s.replace(/,/g, "");
    }
  } else if (hasComma && !hasDot) {
    // 1234,56 -> 1234.56
    s = s.replace(",", ".");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : "";
}

/**
 * Count separators in header line, ignoring quoted sections.
 */
function detectSeparator(headerLine = "") {
  let inQ = false;
  let semi = 0;
  let comma = 0;

  for (let i = 0; i < headerLine.length; i++) {
    const ch = headerLine[i];
    if (ch === '"') {
      if (inQ && headerLine[i + 1] === '"') {
        i++;
      } else {
        inQ = !inQ;
      }
      continue;
    }
    if (!inQ) {
      if (ch === ";") semi++;
      else if (ch === ",") comma++;
    }
  }

  // default to ";" if unclear
  if (semi === 0 && comma === 0) return ";";
  return semi >= comma ? ";" : ",";
}

function splitCsvLine(line = "", sep = ",") {
  const out = [];
  let cur = "";
  let inQ = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
      continue;
    }

    if (ch === sep && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out.map((s) => String(s ?? "").trim());
}

function parseList(value, seps = [";", "|"]) {
  const s = String(value ?? "").trim();
  if (!s) return [];

  // Pick the first separator that exists
  const sep = seps.find((x) => s.includes(x));
  if (!sep) return [s];

  return s
    .split(sep)
    .map((x) => String(x).trim())
    .filter(Boolean);
}

/**
 * Main export
 */
export function parseCSV(text) {
  const csv = stripBOM(String(text || "")).replace(/\r/g, "");
  const lines = csv
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  if (!lines.length) return [];

  const sep = detectSeparator(lines[0]);
  const headers = splitCsvLine(lines[0], sep).map((h) => stripBOM(h));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i], sep);
    if (!cols.length) continue;

    const o = {};
    for (let c = 0; c < headers.length; c++) {
      o[headers[c]] = cols[c] ?? "";
    }

    // Normalize common fields if present
    if ("name" in o) o.name = String(o.name ?? "").trim();
    if ("category" in o) o.category = String(o.category ?? "").trim();
    if ("description" in o) o.description = String(o.description ?? "").trim();
    if ("id" in o) o.id = String(o.id ?? "").trim();

    // Numeric fields (only if they exist)
    if ("price" in o) o.price = parseNumberLoose(o.price);
    if ("edgePrice" in o) o.edgePrice = parseNumberLoose(o.edgePrice);
    if ("discount" in o) o.discount = parseNumberLoose(o.discount);
    if ("thickness_mm" in o) o.thickness_mm = parseNumberLoose(o.thickness_mm);

    // Optional list-ish fields (keeps backward compatibility)
    if ("finish" in o) o.finish = parseList(o.finish, [";", "|"]);
    if ("thicknessOptions" in o) o.thicknessOptions = parseList(o.thicknessOptions, [";", "|"]);
    if ("pros" in o) o.pros = parseList(o.pros, ["|", ";"]);
    if ("cons" in o) o.cons = parseList(o.cons, ["|", ";"]);

    rows.push(o);
  }

  return rows;
}
