// Path: scripts/build.mjs
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function isTruthyEnv(name) {
  const v = String(process.env[name] || "").toLowerCase().trim();
  return v === "1" || v === "true" || v === "yes";
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const SKIP_PRERENDER = isTruthyEnv("SKIP_PRERENDER");
const SKIP_SITEMAP = isTruthyEnv("SKIP_SITEMAP");

// ✅ En enda sanningskälla för output-mappen (default: dist)
const OUT_DIR =
  process.env.DIST_DIR ||
  process.env.BUILD_OUTDIR ||
  process.env.VITE_OUTDIR ||
  "dist";

// Exportera samma OUT_DIR vidare till alla scripts så inget “dist0/dist3” kan smyga in
function envWithOutDir(extra = {}) {
  return {
    ...process.env,
    DIST_DIR: OUT_DIR,
    BUILD_OUTDIR: OUT_DIR,
    VITE_OUTDIR: OUT_DIR,
    ...extra,
  };
}

async function main() {
  console.log("🚀 Startar byggprocess...");
  console.log(`📦 OUT_DIR = "${OUT_DIR}"`);
  console.log(`⏭️  SKIP_PRERENDER = ${SKIP_PRERENDER ? "ON" : "OFF"}`);
  console.log(`⏭️  SKIP_SITEMAP   = ${SKIP_SITEMAP ? "ON" : "OFF"}`);

  // 1) Vite build
  // OBS: vite tar outDir från vite.config.js; men vi skickar ändå env för att hålla allt synkat
  await run("npx", ["vite", "build"], { cwd: projectRoot, env: envWithOutDir() });

  // 2) Prerender (skriver in i samma OUT_DIR, inte dist3)
  if (!SKIP_PRERENDER) {
    await run("node", ["scripts/generate-prerender-links.mjs"], {
      cwd: projectRoot,
      env: envWithOutDir(),
    });

    await run("node", ["scripts/prerender-with-puppeteer.mjs"], {
      cwd: projectRoot,
      env: envWithOutDir(),
    });
  } else {
    console.log("⏭️  Hoppar över prerender.");
  }

  // 3) Sitemap
  if (!SKIP_SITEMAP) {
    await run("node", ["scripts/generate-sitemaps-from-dist.mjs"], {
      cwd: projectRoot,
      env: envWithOutDir(),
    });
  } else {
    console.log("⏭️  Hoppar över sitemap.");
  }

  console.log("✅ Byggprocessen slutförd utan fel!");
}

main().catch((e) => {
  console.error("❌ build failed:", e?.message || e);
  process.exit(1);
});
