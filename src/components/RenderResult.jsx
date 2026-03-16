export default function RenderResult({ renderUrl, modeLabel, materialName, shapeLabel, renderTime, history=[], onDownload, onSave, onShare, onNewRender, onCompareOpen, onReport, onSelectHistory, activeId }) {
  return (
    <div className="rounded-2xl border bg-black/90 text-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-white/10 text-sm">{modeLabel}</span>
          <span className="px-2 py-1 rounded bg-white/10 text-sm">Material: {materialName}</span>
          <span className="px-2 py-1 rounded bg-white/10 text-sm">Form: {shapeLabel}</span>
          <span className="px-2 py-1 rounded bg-white/10 text-sm">Tid: {renderTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm" onClick={onDownload}>Ladda ner</button>
          <button className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm" onClick={onSave}>Spara</button>
          <button className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm" onClick={onShare}>Dela länk</button>
          <button className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm" onClick={onNewRender}>Ny rendering</button>
        </div>
      </div>

      <div className="relative w-full bg-black flex items-center justify-center" style={{minHeight: 360}}>
        <img src={renderUrl} alt="Renderingsresultat" className="max-h-[70vh] w-auto object-contain" />
        <span className="absolute bottom-3 right-3 text-white/70 text-xs font-semibold tracking-wide drop-shadow">
          marmorskivan.se
        </span>
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-white/70">Tidigare renderingar</div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={onCompareOpen}>Jämför</button>
            <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={onReport}>Rapportera problem</button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {history.map((h) => (
            <button key={h.id} className={`relative h-20 w-32 rounded overflow-hidden border ${h.id===activeId ? "border-white" : "border-white/20"}`} onClick={() => onSelectHistory(h.id)}>
              <img src={h.thumbUrl} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-1 left-1 text-[10px] px-1 py-0.5 rounded bg-black/60">
                {h.modeIcon} {h.materialShort}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
