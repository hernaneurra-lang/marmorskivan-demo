// Path: src/components/ExtraSurfacesSection.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const mmToM = (mm) => (Number(mm) || 0) / 1000;

export default function ExtraSurfacesSection({ items, setItems, max = 4 }) {
  const { t } = useTranslation();

  const add = () => setItems([...(items || []), { lengthMm: 1000, depthMm: 600 }]);
  const remove = (idx) => setItems((items || []).filter((_, i) => i !== idx));

  const total = useMemo(() => {
    return (items || []).reduce((s, it) => s + mmToM(it.lengthMm) * mmToM(it.depthMm), 0);
  }, [items]);

  const title = t("extraSurfaces.title", { defaultValue: "Extra surfaces (rectangular)" });
  const sumLabel = t("extraSurfaces.sum", { defaultValue: "Sum" });
  const addLabel = t("extraSurfaces.add", { defaultValue: "Add surface" });
  const removeTitle = t("extraSurfaces.removeTitle", { defaultValue: "Remove surface" });
  const maxText = t("extraSurfaces.maxText", {
    max,
    defaultValue: `Max ${max} extra surfaces. More can be added during consultation.`,
  });

  const lengthLabel = (idx) =>
    t("extraSurfaces.lengthLabel", {
      index: idx + 1,
      defaultValue: `Length (mm) – Surface ${idx + 1}`,
    });

  const depthLabel = (idx) =>
    t("extraSurfaces.depthLabel", {
      index: idx + 1,
      defaultValue: `Depth (mm) – Surface ${idx + 1}`,
    });

  return (
    <section className="rounded-2xl border p-5 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="text-sm text-gray-600">
          {sumLabel}: <strong>{total.toFixed(2)} m²</strong>
        </div>
      </div>

      {(items || []).length === 0 ? (
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
        >
          {addLabel}
        </button>
      ) : (
        <div className="space-y-4">
          {(items || []).map((it, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-3 max-w-lg relative">
              <NumberInput
                label={lengthLabel(idx)}
                value={it.lengthMm}
                onChange={(v) => {
                  const n = [...(items || [])];
                  n[idx].lengthMm = v;
                  setItems(n);
                }}
              />
              <NumberInput
                label={depthLabel(idx)}
                value={it.depthMm}
                onChange={(v) => {
                  const n = [...(items || [])];
                  n[idx].depthMm = v;
                  setItems(n);
                }}
              />

              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "#fff0f0",
                  border: "1px solid #fca5a5",
                  color: "#dc2626",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
                title={removeTitle}
                aria-label={removeTitle}
              >
                ×
              </button>
            </div>
          ))}

          {(items || []).length < max ? (
            <button
              type="button"
              onClick={add}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
            >
              {addLabel}
            </button>
          ) : (
            <p className="text-sm text-gray-600">{maxText}</p>
          )}
        </div>
      )}
    </section>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <label className="text-sm flex flex-col">
      {label}
      <input
        type="number"
        className="mt-1 w-full rounded-lg border px-3 py-2"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}
