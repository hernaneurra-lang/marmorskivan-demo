// Path: scripts/prerender-with-puppeteer.mjs
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";

const SKIP_PRERENDER =
  process.env.SKIP_PRERENDER === "1" ||
  process.env.SKIP_PRERENDER === "true" ||
  process.env.SKIP_PRERENDER === "yes";

if (SKIP_PRERENDER) {
  console.log("⏭️  SKIP_PRERENDER enabled – exiting prerender script.");
  process.exit(0);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");

// ✅ SYNC: Standardiserad utmapp-logik.
// Prioriterar miljövariabler, annars används standardvärdet "dist".
const OUT_DIR =
  process.env.PRERENDER_OUTDIR ||
  process.env.DIST_DIR ||
  process.env.BUILD_OUTDIR ||
  process.env.VITE_OUTDIR ||
  "dist";

// Hanterar både absoluta sökvägar (t.ex. C:/dev/...) och relativa i projektet.
const distPath = path.isAbsolute(OUT_DIR) ? OUT_DIR : path.join(projectRoot, OUT_DIR);

const PREVIEW_PORT = Number(process.env.PRERENDER_PORT || 4173);
const BASE_URL = `http://localhost:${PREVIEW_PORT}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function startPreview() {
  // ✅ --outDir säkerställer att preview-servern läser från rätt mapp (dist).
  return spawn(
    "npx",
    ["vite", "preview", "--outDir", OUT_DIR, "--port", String(PREVIEW_PORT), "--strictPort"],
    {
      cwd: projectRoot,
      stdio: "inherit",
      shell: true, // Krävs för Windows/Git Bash.
    }
  );
}

function readRoutesFromPrerenderLinks() {
  const linksFile = path.join(distPath, "prerender-links.html");
  if (!fs.existsSync(linksFile)) {
    throw new Error(
      `❌ Hittar inte ${linksFile}. (generate-prerender-links.mjs måste köras innan prerender.)`
    );
  }

  const html = fs.readFileSync(linksFile, "utf8");
  const routes = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

  return [...new Set(routes)]
    .map((r) => (r.startsWith("/") ? r : `/${r}`))
    .filter((r) => r.length > 0);
}

function routeToOutputFile(route) {
  // "/" -> dist/index.html
  if (route === "/") return path.join(distPath, "index.html");
  // "/material/x" -> dist/material/x/index.html
  return path.join(distPath, route.replace(/^\//, ""), "index.html");
}

async function run() {
  console.log(`ℹ️ prerender OUT_DIR="${OUT_DIR}" -> ${distPath}`);

  if (!fs.existsSync(distPath)) {
    throw new Error(`❌ dist saknas: ${distPath}. Kör "vite build" först.`);
  }

  const preview = startPreview();
  // Ge servern tid att starta ordentligt.
  await sleep(2500);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const routes = readRoutesFromPrerenderLinks();
  const failed = [];

  let done = 0;

  try {
    for (const route of routes) {
      try {
        await page.goto(BASE_URL + route, { waitUntil: "networkidle0" });

        const outFile = routeToOutputFile(route);
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, await page.content(), "utf8");

        done++;
        if (done % 25 === 0 || done === routes.length) {
          console.log(`✅ prerender progress: ${done}/${routes.length}`);
        }
      } catch (e) {
        failed.push(route);
        console.error(`❌ prerender FAIL: ${route} -> ${e?.message || e}`);
      }
    }

    if (failed.length) {
      fs.writeFileSync(path.join(distPath, "prerender-failed.txt"), failed.join("\n"), "utf8");
    }

    console.log(`🎉 prerender done: ${done}/${routes.length}`);
    if (failed.length) {
      console.log(`⚠️ failed routes: ${failed.length} (se ${OUT_DIR}/prerender-failed.txt)`);
      process.exitCode = 1;
    }
  } finally {
    await browser.close().catch(() => {});
    preview.kill(); // Stänger av preview-servern efter avslut.
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});