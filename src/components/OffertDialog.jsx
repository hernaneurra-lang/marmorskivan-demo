// src/components/OffertDialog.jsx
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function OffertDialog({ open, onClose, onSubmit, initial = {} }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    namn: "",
    epost: "",
    telefon: "",
    adress: "",
    kommun: "",
    meddelande: "",
    ...initial,
  });

  useEffect(() => {
    if (open) setForm((f) => ({ ...f, ...initial }));
  }, [open, initial]);

  const isValid = useMemo(() => form.namn.trim() && form.epost.trim(), [form]);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={t("offertDialog.title", { defaultValue: "Skicka offertförfrågan" })}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {t("offertDialog.title", { defaultValue: "Skicka offertförfrågan" })}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label={t("common.close", { defaultValue: "Stäng" })}
            title={t("common.close", { defaultValue: "Stäng" })}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isValid) onSubmit?.(form);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <label className="block">
            <span className="text-sm text-gray-700">
              {t("offertDialog.fields.name", { defaultValue: "Namn" })} *
            </span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.namn}
              onChange={(e) => setForm({ ...form, namn: e.target.value })}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">
              {t("offertDialog.fields.email", { defaultValue: "E-post" })} *
            </span>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.epost}
              onChange={(e) => setForm({ ...form, epost: e.target.value })}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">
              {t("offertDialog.fields.phone", { defaultValue: "Telefon" })}
            </span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })}
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">
              {t("offertDialog.fields.municipality", { defaultValue: "Kommun" })}
            </span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.kommun}
              onChange={(e) => setForm({ ...form, kommun: e.target.value })}
              placeholder={t("offertDialog.placeholders.municipality", {
                defaultValue: "t.ex. Västerås",
              })}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm text-gray-700">
              {t("offertDialog.fields.addressOptional", { defaultValue: "Adress (valfritt)" })}
            </span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.adress}
              onChange={(e) => setForm({ ...form, adress: e.target.value })}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm text-gray-700">
              {t("offertDialog.fields.messageOptional", { defaultValue: "Meddelande (valfritt)" })}
            </span>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[96px]"
              value={form.meddelande}
              onChange={(e) => setForm({ ...form, meddelande: e.target.value })}
              placeholder={t("offertDialog.placeholders.message", {
                defaultValue: "Beskriv kort vad du planerar",
              })}
            />
          </label>

          <div className="sm:col-span-2 mt-2 flex gap-3">
            <button
              type="submit"
              disabled={!isValid}
              className={`px-6 py-2 rounded-xl font-semibold ${
                isValid
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {t("offertDialog.actions.submit", { defaultValue: "Skicka förfrågan" })}
            </button>

            <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl border">
              {t("common.cancel", { defaultValue: "Avbryt" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
