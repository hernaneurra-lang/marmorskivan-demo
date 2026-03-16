// Path: src/components/BacksplashSection.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function BacksplashSection({ backsplashes = [], setBacksplashes }) {
  const { t } = useTranslation();

  const update = (idx, patch) => {
    const next = backsplashes.map((b, i) => (i === idx ? { ...b, ...patch } : b));
    setBacksplashes(next);
  };

  const add = () => {
    setBacksplashes([...(backsplashes || []), { length: 0, height: 0 }]);
  };

  const remove = (idx) => {
    setBacksplashes(backsplashes.filter((_, i) => i !== idx));
  };

  return (
    <section className="rounded-2xl border p-5 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">
          {t("calc.backsplash.title", { defaultValue: "Backsplash" })}
        </h2>

        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
        >
          {t("calc.backsplash.add", { defaultValue: "Add backsplash" })}
        </button>
      </div>

      {backsplashes.length === 0 ? (
        <p className="text-sm text-gray-600">
          {t("calc.backsplash.empty", { defaultValue: "No backsplashes added yet." })}
        </p>
      ) : (
        <div className="space-y-3">
          {backsplashes.map((b, idx) => (
            <div key={idx} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
              <NumberField
                label={t("calc.backsplash.fields.length", { defaultValue: "Length (mm)" })}
                value={b.length}
                onChange={(val) => update(idx, { length: val })}
              />
              <NumberField
                label={t("calc.backsplash.fields.height", { defaultValue: "Height (mm)" })}
                value={b.height}
                onChange={(val) => update(idx, { height: val })}
              />

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="px-3 py-1.5 rounded-lg border text-red-600 hover:bg-red-50"
                  title={t("calc.backsplash.removeTitle", { defaultValue: "Remove" })}
                >
                  {t("calc.backsplash.remove", { defaultValue: "Remove" })}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------- Inputs som ersätter 0 direkt ------- */

function NumberField({ label, value, onChange }) {
  const { t } = useTranslation();

  // Visa "" om värdet är 0 för att undvika "02500"
  const display = value === 0 || value === "0" ? "" : value ?? "";

  const selectAll = (e) => {
    requestAnimationFrame(() => e.target.select());
  };

  const preventUnselect = (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    const v = e.target.value;
    if (v === "" || v === null) {
      onChange(0);
    } else {
      const n = Number(v);
      onChange(Number.isFinite(n) ? n : 0);
    }
  };

  return (
    <label className="text-sm flex flex-col">
      {label}
      <input
        type="number"
        inputMode="numeric"
        step="1"
        min="0"
        placeholder={t("calc.backsplash.mmPlaceholder", { defaultValue: "mm" })}
        className="mt-1 w-full rounded-lg border px-3 py-2"
        value={display}
        onChange={handleChange}
        onFocus={selectAll}
        onClick={selectAll}
        onMouseUp={preventUnselect}
      />
    </label>
  );
}
