// Path: src/pages/RenderWorkspace.jsx
import { useState } from "react";
import PreviewCard from "../components/render/PreviewCard";
import RenderPanel from "../components/render/RenderPanel";
import RenderModalPro from "../components/render/RenderModalPro";
import CompareSlider from "../components/render/CompareSlider";
import { postRender } from "../lib/render/api";
import { getRenders, addRender } from "../lib/render/store";
import { exportPdf } from "../lib/render/exportPdf";

/**
 * RenderWorkspace
 * Fristående sida/panel för Koncept C: Preview + Galleri + Jämförelse.
 *
 * Props:
 *  - previewPng:  string  | PNG-data-URL eller URL (skissen)
 *  - payload:     object  | skickas till postRender(payload) (material/geometry m.m.)
 *  - material:    {name, price?} | visas som badge i modal
 *  - shape:       string  | visas i PDF-exportens metadata
 *  - tips:        string  | frivillig status-/tipsrad
 */
export default function RenderWorkspace({
  previewPng,
  payload,
  material,
  shape,
  tips = "Tips: Välj en sten med tydlig textur för att se skillnad i renderingen.",
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState(() => safeGetRenders());
  const [modal, setModal] = useState({ open: false, url: "", err: null });

  const hasPreview = Boolean(previewPng);

  async function doRender() {
    try {
      setBusy(true);
      setStatus("Skickar till render-tjänst…");
      const { ok, data, status: http } = await postRender(payload);
      if (!ok) throw new Error(`Render misslyckades (HTTP ${http || "?"})`);
      const url = data.imageUrl || data.url;
      const next = addRender({ url, title: "AI-rendering", material: material?.name });
      setHistory(next);
      setModal({ open: true, url, err: null });
      setStatus("Klart!");
    } catch (e) {
      // Fallback: visa skiss och fel
      setModal({ open: true, url: previewPng || "", err: (e && e.message) || String(e) });
      setStatus("Fel uppstod.");
    } finally {
      setBusy(false);
    }
  }

  function handleExportPdf() {
    const imgs = [];
    if (previewPng) imgs.push(previewPng);
    exportPdf(imgs, { material: material?.name, shape });
  }

  function handleFullscreen() {
    if (typeof window !== "undefined" && hasPreview) {
      window.open(previewPng, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <PreviewCard
          title="Förhandsvisning (skiss)"
          onExport={handleExportPdf}
          onFullscreen={handleFullscreen}
        >
          {hasPreview ? (
            <img src={previewPng} alt="Skiss" className="w-full h-auto" />
          ) : (
            <div className="p-8 text-sm text-gray-600">Ingen skiss att visa ännu.</div>
          )}
        </PreviewCard>

        {/* Före/Efter – jämför skiss och senaste render */}
        {hasPreview && history[0]?.url && (
          <CompareSlider beforeSrc={previewPng} afterSrc={history[0].url} height={420} />
        )}
      </div>

      <RenderPanel
        onRender={doRender}
        busy={busy}
        status={status}
        tips={tips}
        history={history}
        onPickHistory={(item) => setModal({ open: true, url: item.url, err: null })}
      />

      <RenderModalPro
        open={modal.open}
        onClose={() => setModal({ open: false, url: "", err: null })}
        title="AI-rendering av kök"
        imageUrl={modal.url}
        material={material}
        busy={busy}
        error={modal.err}
        onRetry={doRender}
      />
    </div>
  );
}

function safeGetRenders() {
  try {
    return getRenders();
  } catch {
    return [];
  }
}
