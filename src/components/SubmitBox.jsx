// Path: src/components/SubmitBox.jsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { slug } from "../lib/materialUtils";

// --------------------
// GA4 helper (failsafe)
// --------------------
function trackEvent(name, params = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", name, params);
    }
  } catch {
    // never block UX / flow
  }
}

function SubmitBox({ variant, openings, totals, context }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const tp = (key, fallback = "") => {
    const val = t(key, { defaultValue: fallback });
    return val === key ? fallback : val;
  };

  // --------------------
  // Stable analytics props
  // --------------------
  const analyticsBase = useMemo(() => {
    const materialName = variant?.name || "";
    const thicknessMm = variant?.thicknessMm ?? variant?.thicknessMm; // safe-ish
    const totalEstimate =
      typeof totals?.total === "number"
        ? totals.total
        : typeof totals?.summary?.total === "number"
          ? totals.summary.total
          : undefined;

    return {
      material_name: materialName,
      material_slug: materialName ? slug(materialName) : "",
      thickness_mm: typeof thicknessMm === "number" ? thicknessMm : undefined,
      total_estimate: typeof totalEstimate === "number" ? totalEstimate : undefined,
    };
  }, [variant?.name, variant?.thicknessMm, totals?.total, totals?.summary?.total]);

  // --------------------
  // Payload (unchanged endpoint)
  // --------------------
  const buildPayload = () => ({
    customer: { ...form },
    selections: {
      material: variant
        ? {
            name: variant.name,
            slug: slug(variant.name),

            // ✅ OPTIONAL: include thickness explicitly (safe, but remove if you want payload 100% unchanged)
            thicknessMm: variant.thicknessMm,
          }
        : null,

      sink: { mount: openings?.sink?.mount || "", items: openings?.sink?.items || [] },
      faucet: { items: openings?.faucet?.items || [] },
      hob: { mount: openings?.hob?.mount || "", items: openings?.hob?.items || [] },
      globalCounts: openings?.globalCounts || {},
    },
    quote: {
      // keep your totals structure; we don’t change server flow
      total: totals?.total ?? totals?.summary?.total ?? 0,
      vat: totals?.vat ?? totals?.summary?.vat ?? 0,

      // if you pass these from CalculatorPage, they’ll be here; otherwise harmless
      accessoriesTotal: totals?.accessoriesTotal ?? 0,
      totalStoneM2: totals?.totalStoneM2 ?? 0,
    },
    context,
    page: {
      url: typeof window !== "undefined" ? window.location.href : "",
      ts: new Date().toISOString(),
      lang: typeof document !== "undefined" ? document.documentElement.lang || "sv" : "sv",
    },
  });

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  const openModal = () => {
    // ✅ EVENT 1: user clicked to open offert modal
    trackEvent("offert_open", {
      ...analyticsBase,
    });

    setOpen(true);
  };

  const submit = async () => {
    // ✅ EVENT 2: submit attempt
    trackEvent("offert_submit_attempt", {
      ...analyticsBase,
      has_phone: Boolean(form.phone),
      has_message: Boolean(form.message),
    });

    if (!form.name || !form.email) {
      // ✅ EVENT 3: validation error
      trackEvent("offert_submit_validation_error", {
        ...analyticsBase,
        missing_name: !form.name,
        missing_email: !form.email,
      });

      alert(t("offert.validation.required", "Fyll i namn och e-post."));
      return;
    }

    setSending(true);

    try {
      const url = "/boka-tid/api/send-quote.php"; // ⚠️ keep exactly your working endpoint

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.ok) {
        // ✅ EVENT 4: success
        trackEvent("offert_submit_success", {
          ...analyticsBase,
        });

        window.location.href = "/boka-tid/api/tack-for-offert.php";
      } else {
        // ✅ EVENT 5: server responded but not ok
        trackEvent("offert_submit_error", {
          ...analyticsBase,
          http_status: res.status,
          error: String(data?.error || `Fel ${res.status}`),
        });

        alert(t("offert.validation.sendFailed", { error: data?.error || `Fel ${res.status}` }));
      }
    } catch (err) {
      // ✅ EVENT 6: network / exception
      trackEvent("offert_submit_error", {
        ...analyticsBase,
        error: String(err),
      });

      alert(t("offert.validation.sendFailed", { error: String(err) }));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl transition-all active:scale-95"
      >
        {t("offert.openButton", "Gå vidare till offertfråga →")}
      </button>

      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100] p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
              type="button"
              aria-label={t("common.close", "Stäng")}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-2">{t("offert.title", "Offertförfrågan")}</h2>
            <p className="text-gray-500 text-sm mb-6">
              {t("offert.subtitle", "Fyll i dina uppgifter så skickar vi en formell offert med specifikation.")}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("offert.fields.name", "Ditt Namn")}
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  value={form.name}
                  placeholder={tp("offert.placeholders.name", "För- och efternamn")}
                  onChange={(e) => onChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("offert.fields.email", "E-post")}
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  value={form.email}
                  placeholder={tp("offert.placeholders.email", "namn@epost.se")}
                  onChange={(e) => onChange("email", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("offert.fields.phone", "Telefonnummer")}
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  value={form.phone}
                  placeholder={tp("offert.placeholders.phone", "070-000 00 00")}
                  onChange={(e) => onChange("phone", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("offert.fields.message", "Övrig information (valfritt)")}
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[100px]"
                  value={form.message}
                  placeholder={tp("offert.placeholders.message", "T.ex. önskat montage-datum eller frågor...")}
                  onChange={(e) => onChange("message", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 pt-4">
                <button
                  type="button"
                  onClick={submit}
                  disabled={sending}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("offert.actions.sending", "Skickar...")}
                    </>
                  ) : (
                    t("common.send", "Skicka förfrågan")
                  )}
                </button>

                <p className="text-[10px] text-center text-gray-400 mt-4">
                  {t(
                    "offert.consent",
                    "Genom att skicka samtycker du till att vi hanterar dina uppgifter för att kunna återkomma med en offert."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SubmitBox;
