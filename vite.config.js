// Path: vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(() => {
  const outDir = process.env.BUILD_OUTDIR || process.env.VITE_OUTDIR || "dist";

  return {
    plugins: [react()],

    resolve: {
      dedupe: ["react", "react-dom", "react-router-dom", "react-router"],
      alias: {
        react: path.resolve(process.cwd(), "node_modules/react"),
        "react-dom": path.resolve(process.cwd(), "node_modules/react-dom"),
      },
    },

    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // -----------------------------
            // 1) Splitta vår egen kod (säkert)
            // -----------------------------
            if (!id.includes("node_modules")) {
              if (id.includes("/src/pages/material/")) return "page-material";
              if (id.includes("/src/seo/")) return "page-seo";
              if (id.includes("/src/pages/")) return "page-pages";
              if (id.includes("/src/components/")) return "page-components";
              return;
            }

            // -----------------------------
            // 2) Vendor-core: React + allt som använder context/hooks
            // -----------------------------
            const corePkgs = [
              "/react/",
              "/react-dom/",
              "react-router",
              "react-helmet-async",
              "i18next",
              "react-i18next",
              "use-sync-external-store",
              "framer-motion",
            ];
            if (corePkgs.some((p) => id.includes(p))) return "vendor-core";

            // -----------------------------
            // 3) Vendor-UI: ikoner (separat, men säkert)
            // -----------------------------
            if (id.includes("lucide-react") || id.includes("react-icons")) {
              return "vendor-ui";
            }

            // -----------------------------
            // 4) Vendor: resten
            // -----------------------------
            return "vendor";
          },
        },
      },
    },

    server: {
      watch: {
        ignored: ["**/dist/**", "**/node_modules/**", "**/.git/**"],
      },
      proxy: {
        "/api/ai-render": { target: "http://localhost:3333", changeOrigin: true },
        "/api/send-quote": { target: "http://localhost:3333", changeOrigin: true },
        "/api": { target: "http://localhost:8000", changeOrigin: true },
      },
    },
  };
});
