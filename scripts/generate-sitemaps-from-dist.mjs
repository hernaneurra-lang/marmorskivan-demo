// Path: scripts/generate-sitemaps-from-dist.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Din domän
const DOMAIN = "https://marmorskivan.se";

// ✅ SYNC: Standardiserad till "dist" (kan override:as via DIST_DIR / BUILD_OUTDIR / VITE_OUTDIR)
const DIST_DIR =
  process.env.DIST_DIR ||
  process.env.BUILD_OUTDIR ||
  process.env.VITE_OUTDIR ||
  "dist";

// Om du deployar i subpath (t.ex. /app), sätt BASE_PATH="/app". Annars ""
const BASE_PATH = "";

// --- Project root (så relativa paths alltid blir rätt) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// ✅ Rätt distPath: absolut om DIST_DIR är absolut, annars relativt projektet
const distPath = path.isAbsolute(DIST_DIR) ? DIST_DIR : path.join(projectRoot, DIST_DIR);

function cleanPath(p = "") {
  let x = String(p || "").trim();
  if (!x.startsWith("/")) x = "/" + x;
  x = x.replace(/\/+/g, "/");

  if (BASE_PATH) {
    const bp = BASE_PATH.startsWith("/") ? BASE_PATH : `/${BASE_PATH}`;
    x = `${bp.replace(/\/+$/g, "")}${x}`;
    x = x.replace(/\/+/g, "/");
  }
  return x;
}

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    console.warn(`⚠️ sitemap: kan inte läsa mapp (skippas): ${dir}`);
    return null;
  }
}

function walk(dir) {
  const ents = safeReaddir(dir);
  if (!ents) return [];
  const out = [];
  for (const ent of ents) {
    const full = path.join(dir, ent.name);
    if (ent.isSymbolicLink && ent.isSymbolicLink()) continue;
    if (ent.isDirectory()) out.push(...walk(full));
    else if (ent.isFile()) out.push(full);
  }
  return out;
}

function fileToPath(fp, distPathAbs) {
  let rel = path.relative(distPathAbs, fp).replace(/\\/g, "/");
  if (!rel.toLowerCase().endsWith(".html")) return "";

  const lower = rel.toLowerCase();
  if (lower === "404.html" || lower.endsWith("/404.html")) return "";

  if (lower === "index.html") return "/";

  if (lower.endsWith("/index.html")) rel = rel.slice(0, -"/index.html".length);
  else rel = rel.replace(/\.html$/i, "");

  return "/" + rel;
}

function buildUrlset(urlPaths, { priorityFn, changefreqFn } = {}) {
  const domain = DOMAIN.replace(/\/+$/g, "");
  const now = new Date().toISOString();

  const body = [...urlPaths]
    .sort((a, b) => a.localeCompare(b, "sv"))
    .map((p) => {
      const prio = priorityFn ? priorityFn(p) : (p === "/" ? "1.0" : "0.8");
      const freq = changefreqFn ? changefreqFn(p) : "weekly";
      return `  <url>
    <loc>${domain}${cleanPath(p)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
  </url>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    body +
    `\n</urlset>\n`
  );
}

function buildSitemapIndex(sitemaps) {
  const domain = DOMAIN.replace(/\/+$/g, "");
  const now = new Date().toISOString();

  const body = sitemaps
    .map((sm) => {
      return `  <sitemap>
    <loc>${domain}${cleanPath(sm)}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    body +
    `\n</sitemapindex>\n`
  );
}

console.log(`ℹ️ sitemap using DIST_DIR="${DIST_DIR}" -> ${distPath}`);

if (!fs.existsSync(distPath)) {
  console.error(`❌ Hittar inte dist-mappen: ${distPath}`);
  console.error(`💡 Tips: Kör build först och kontrollera outDir.`);
  process.exit(1);
}

const files = walk(distPath);
const allPaths = new Set();

for (const fp of files) {
  const p = fileToPath(fp, distPath);
  if (p) allPaths.add(p);
}

// ---- Klassificera ----
const isMaterial = (p) => p === "/material" || p.startsWith("/material/");
const materialPaths = [...allPaths].filter(isMaterial);
const seoPaths = [...allPaths].filter((p) => !isMaterial(p));

// ---- Skriv sitemap-filer ----
const outSeo = path.join(distPath, "sitemap-seo.xml");
const outMat = path.join(distPath, "sitemap-material.xml");
const outIndex = path.join(distPath, "sitemap.xml");

fs.writeFileSync(
  outSeo,
  buildUrlset(seoPaths, {
    priorityFn: (p) => (p === "/" ? "1.0" : "0.9"),
    changefreqFn: (p) => (p === "/" ? "daily" : "weekly"),
  }),
  "utf8"
);

fs.writeFileSync(
  outMat,
  buildUrlset(materialPaths, {
    priorityFn: () => "0.7",
    changefreqFn: () => "monthly",
  }),
  "utf8"
);

fs.writeFileSync(
  outIndex,
  buildSitemapIndex(["/sitemap-seo.xml", "/sitemap-material.xml"]),
  "utf8"
);

console.log(`✅ sitemap index skapad: ${outIndex}`);
console.log(`✅ sitemap-seo.xml: ${seoPaths.length} URL:er`);
console.log(`✅ sitemap-material.xml: ${materialPaths.length} URL:er`);
