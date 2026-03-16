import fs from "fs";
import path from "path";

let cache = { items: [], loadedAt: 0 };

function parseCSV(csv) {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return rows.map(r=>{
    // enkel csv-splitting (för robust: använd csv-parse)
    const cols = r.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(s=>s.replace(/^"|"$/g,"")) || [];
    const obj = {};
    headers.forEach((h, i)=> obj[h] = cols[i] ?? "");
    // konvertera vissa fält
    obj.pris_per_m2 = Number(obj.pris_per_m2||0);
    obj.kantpris_per_m = Number(obj.kantpris_per_m||0);
    obj.tjocklekar_mm = (obj.tjocklekar_mm||"").split("|").filter(Boolean).map(Number);
    obj.finish = (obj.finish||"").split("|").filter(Boolean);
    obj.fordelar = (obj.fordelar||"").split("|").filter(Boolean);
    obj.varme = Number(obj.varme||0);
    obj.rep = Number(obj.rep||0);
    obj.flack = Number(obj.flack||0);
    return obj;
  });
}

function loadMaterials() {
  const p = path.join(process.cwd(), "data", "materials.csv");
  const csv = fs.readFileSync(p, "utf-8");
  cache.items = parseCSV(csv);
  cache.loadedAt = Date.now();
}

export default function handler(req, res) {
  try {
    if (!cache.items.length) loadMaterials();
    const { kategori, farg, finish, tjocklek, q, pris_min, pris_max } = req.query;

    let items = cache.items.slice();
    if (kategori) items = items.filter(x=> x.kategori === kategori);
    if (farg) items = items.filter(x=> (x.farg||"").toLowerCase().includes(String(farg).toLowerCase()));
    if (finish) items = items.filter(x=> x.finish?.includes(finish));
    if (tjocklek) items = items.filter(x=> x.tjocklekar_mm?.includes(Number(tjocklek)));
    if (pris_min) items = items.filter(x=> x.pris_per_m2 >= Number(pris_min));
    if (pris_max) items = items.filter(x=> x.pris_per_m2 <= Number(pris_max));
    if (q) {
      const s = String(q).toLowerCase();
      items = items.filter(x=> (x.namn||"").toLowerCase().includes(s) || (x.id||"").toLowerCase().includes(s));
    }

    res.status(200).json({ items, total: items.length, loadedAt: cache.loadedAt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load materials" });
  }
}
