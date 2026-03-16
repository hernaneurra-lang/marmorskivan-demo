export type Mode = "draft" | "standard" | "high";
export type Shape = "Straight" | "L" | "U" | "Custom";

export function sanitizeId(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function formatTimestampStockholm(d = new Date()): string {
  const z = (n: number) => String(n).padStart(2, "0");
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}`;
}

export function buildRenderFilename(
  mode: Mode, materialIdRaw: string, shape: Shape, widthPx: number, heightPx: number, when = new Date()
): string {
  const materialId = sanitizeId(materialIdRaw);
  const stamp = formatTimestampStockholm(when);
  return `render_${mode}_${materialId}_${shape}_${widthPx}x${heightPx}_${stamp}.jpg`;
}

export function buildRenderMetadata(args: {
  renderId: string; mode: Mode; materialId: string; materialName?: string; shape: Shape;
  widthPx: number; heightPx: number; samples: number; engine: "cycles"|"luxcore"|"eevee";
  durationMs?: number; startedAt?: Date; finishedAt?: Date; areaM2?: number; edgesM?: number;
  backsplash?: { panels: number; areaM2: number; edgesM: number }; inputsHash: string; version?: string;
}) {
  const started = (args.startedAt ?? new Date()).toISOString();
  const finished = (args.finishedAt ?? new Date(Date.now() + (args.durationMs ?? 0))).toISOString();
  return {
    renderId: args.renderId,
    mode: args.mode,
    materialId: sanitizeId(args.materialId),
    materialName: args.materialName ?? undefined,
    shape: args.shape,
    dimensions: { widthPx: args.widthPx, heightPx: args.heightPx },
    samples: args.samples,
    engine: args.engine,
    durationMs: args.durationMs ?? undefined,
    startedAt: started,
    finishedAt: finished,
    areaM2: args.areaM2 ?? undefined,
    edgesM: args.edgesM ?? undefined,
    backsplash: args.backsplash ?? undefined,
    watermark: { text: "marmorskivan.se", adaptive: true, plateUsed: false, safeAreaPct: { x: 0.04, y: 0.03 } },
    inputsHash: args.inputsHash,
    version: args.version ?? "1.0.0"
  };
}
