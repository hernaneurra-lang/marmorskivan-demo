// Path: scripts/generate-prerender-links.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");

// ✅ SYNC: Standardiserat till "dist" för att matcha din nya miljö
const OUT_DIR =
  process.env.DIST_DIR ||
  process.env.BUILD_OUTDIR ||
  process.env.VITE_OUTDIR ||
  "dist";

const distPath = path.isAbsolute(OUT_DIR) ? OUT_DIR : path.join(projectRoot, OUT_DIR);
const publicCsv = path.join(projectRoot, "public", "data", "materials.csv");

/**
 * Skapar en URL-vänlig slug för materialen
 */
function slugify(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Tar bort accenter
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Läser in materials.csv och hanterar citattecken korrekt
 */
function parseCsv(text) {
  const rows = [];
  let i = 0, field = "", row = [], inQuotes = false;

  while (i < text.length) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      inQuotes = !inQuotes; i++; continue;
    }
    if (!inQuotes && (c === "," || c === ";")) {
      row.push(field); field = ""; i++; continue;
    }
    if (!inQuotes && (c === "\n" || c === "\r")) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((x) => String(x).trim() !== "")) rows.push(row);
      row = []; i++; continue;
    }
    field += c; i++;
  }
  row.push(field);
  if (row.some((x) => String(x).trim() !== "")) rows.push(row);
  return rows;
}

function safeGet(row, idx) {
  if (idx == null || idx < 0) return "";
  return row?.[idx] ?? "";
}

/**
 * Samlar ihop alla rutter som ska förhandsrenderas
 */
function buildRoutes() {
  const routes = new Set([
    "/",
    "/material",
    "/kalkylator",
    "/calculator",
    // SEO landing pages
    "/bankskiva-sten",
    "/bankskiva-online",
    "/bankskiva-marmor",
    "/bankskiva-granit",
    "/bankskiva-komposit",
    "/bankskiva-keramik",
    "/bankskiva-travertin",
    // Material detail pages
    "/material/marmor",
    "/material/granit",
    "/material/komposit",
    "/material/onyx",
    "/material/kalksten",
    "/material/terrazzo",
    "/material/kvartsit",
    "/material/travertin",
    "/material/semiprecious",
    "/material/atervunnetglas",
  ]);

  if (fs.existsSync(publicCsv)) {
    const text = fs.readFileSync(publicCsv, "utf8");
    const table = parseCsv(text);

    if (table.length > 1) {
      const header = table[0].map((h) => String(h || "").trim().toLowerCase());
      const nameIdx = header.findIndex((h) => ["name", "namn", "material"].includes(h));
      const slugIdx = header.indexOf("slug");
      const idIdx = header.indexOf("id");

      for (let r = 1; r < table.length; r++) {
        const row = table[r];
        const raw = safeGet(row, slugIdx) || safeGet(row, idIdx) || safeGet(row, nameIdx);
        const s = slugify(raw);
        if (s) routes.add(`/material/${s}`);
      }
    }
  }
  return [...routes];
}

function run() {
  console.log(`ℹ️ generate-prerender-links using OUT_DIR="${OUT_DIR}" -> ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.error(`❌ Mappen saknas: ${distPath}`);
    console.log(`💡 Tips: Kontrollera att Vite bygger till rätt mapp (dist).`);
    process.exit(1);
  }

  const routes = buildRoutes();
  const html =
    `<!doctype html><meta charset="utf-8"><title>prerender links</title>\n` +
    routes.map((r) => `<a href="${r}">${r}</a>`).join("\n");

  fs.writeFileSync(path.join(distPath, "prerender-links.html"), html, "utf8");
  console.log(`✅ wrote prerender-links.html (${routes.length} routes) -> ${distPath}`);
}

run();