// Path: scripts/verify-sitemap.mjs
import fs from "fs";
import path from "path";

// SYNC: Ändrad från dist2 till dist
const DIST = path.resolve("dist");
const SITEMAP = path.resolve(DIST, "sitemap.xml");

if (!fs.existsSync(SITEMAP)) {
  console.error("❌ Hittar inte dist/sitemap.xml. Kör sitemap-scriptet först.");
  process.exit(1);
}

const xml = fs.readFileSync(SITEMAP, "utf8");

// Extrahera alla <loc>...</loc>
const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]).filter(Boolean);

// Gör om till paths (tar bort domän)
const paths = locs.map(u => {
  try {
    const url = new URL(u);
    let p = url.pathname;
    // Specialhantering för sitemaps som pekar på andra sitemaps (.xml)
    if (p.endsWith('.xml')) return null; 
    return p.replace(/\/+$/,"") || "/";
  } catch {
    return String(u).trim();
  }
}).filter(Boolean);

function toFilePath(p) {
  const clean = (p === "/" ? "" : p.replace(/^\//, ""));
  return path.join(DIST, clean, "index.html");
}

// Slumpa 20 rutter för kontroll
const sampleSize = Math.min(20, paths.length);
const sample = [];
const used = new Set();
while (sample.length < sampleSize) {
  const i = Math.floor(Math.random() * paths.length);
  if (used.has(i)) continue;
  used.add(i);
  sample.push(paths[i]);
}

let ok = 0;
let bad = 0;

console.log(`🔍 Verifierar ett slumpmässigt urval av ${sampleSize} sidor i /dist...`);

for (const p of sample) {
  const fp = toFilePath(p);
  const exists = fs.existsSync(fp);
  if (exists) {
    ok++;
  } else {
    bad++;
    console.log("❌ FIL SAKNAS:", p, "=>", fp);
  }
}

console.log(`📊 Resultat: ${ok}/${sampleSize} ok.`);

if (bad > 0) {
  console.error("⚠️ Kvalitetskontrollen misslyckades. Vissa renderade sidor saknas!");
  process.exit(2);
} else {
  console.log("✅ Allt ser bra ut! Bygget är redo för uppladdning.");
}