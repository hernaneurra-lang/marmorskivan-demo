// Path: src/lib/render/exportPdf.js
/**
 * exportPdf(images, meta): Enkel PDF via browser-print.
 * Öppnar nytt fönster med ett stilrent A4-dokument där användaren kan spara som PDF.
 */
export function exportPdf(images = [], meta = {}) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=1024,height=768");
  if (!w) return;

  const style = `
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111827; }
    .container { width: 210mm; margin: 0 auto; padding: 16mm 12mm; }
    h1 { font-size: 18pt; margin: 0 0 8mm; }
    .meta { font-size: 10pt; color: #374151; margin-bottom: 6mm; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
    .card { border: 1px solid #E5E7EB; border-radius: 10px; padding: 4mm; }
    .card img { width: 100%; height: auto; }
    .footer { margin-top: 8mm; font-size: 9pt; color: #6B7280; }
    @media print { .no-print { display: none; } }
  `;

  const title = meta.title || "Renderingar";
  const today = new Date().toLocaleString("sv-SE");

  w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title><style>${style}</style></head><body>`);
  w.document.write(`<div class="container">`);
  w.document.write(`<h1>${title}</h1>`);
  w.document.write(`<div class="meta">Material: ${meta.material || "-"} · Form: ${meta.shape || "-"} · Skapat: ${today}</div>`);

  // Grid med bilder
  w.document.write(`<div class="grid">`);
  images.forEach((src) => {
    w.document.write(`<div class="card"><img src="${src}" /></div>`);
  });
  w.document.write(`</div>`);

  w.document.write(`<div class="footer">Genererat från marmorskivan.se</div>`);
  w.document.write(`<div class="no-print" style="margin-top:10mm"><button onclick="window.print()">Skriv ut / Spara som PDF</button></div>`);
  w.document.write(`</div></body></html>`);
  w.document.close();
  w.focus();
}
