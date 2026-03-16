import { useTranslation } from "react-i18next";
import LegalSeoPage from "../components/LegalSeoPage";

/* --- Content-komponent (modal) --- */
export function VillkorContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 p-6">
      <Section
        id="bestallning-offert"
        title={t("terms.sections.orderQuote.title", { defaultValue: "Beställning & offert" })}
      >
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            {t("terms.sections.orderQuote.items.0", {
              defaultValue:
                "Kostnadsfri estimering via vår kalkylator. Slutligt pris fastställs efter måttning på plats.",
            })}
          </li>
          <li>
            {t("terms.sections.orderQuote.items.1", {
              defaultValue: "Offertens giltighetstid framgår i offerten (normalt 30 dagar).",
            })}
          </li>
          <li>
            {t("terms.sections.orderQuote.items.2", {
              defaultValue: "Beställning blir bindande när du skriftligen godkänner vår offert.",
            })}
          </li>
        </ul>
      </Section>

      <Section
        id="mattning-tillverkning"
        title={t("terms.sections.measureManufactureInstall.title", {
          defaultValue: "Måttning, tillverkning & montering",
        })}
      >
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            {t("terms.sections.measureManufactureInstall.items.0", {
              defaultValue: "Vår montör genomför måttning enligt överenskommen tid.",
            })}
          </li>
          <li>
            {t("terms.sections.measureManufactureInstall.items.1", {
              defaultValue:
                "Efter godkända mått startas tillverkning. Leveranstid meddelas i samband med beställning.",
            })}
          </li>
          <li>
            {t("terms.sections.measureManufactureInstall.items.2", {
              defaultValue:
                "Montering sker av vårt team. Underlaget ska vara färdigt och stabilt enligt instruktion.",
            })}
          </li>
        </ul>
      </Section>

      <Section
        id="priser-betalning"
        title={t("terms.sections.pricesPayment.title", { defaultValue: "Priser & betalning" })}
      >
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            {t("terms.sections.pricesPayment.items.0", {
              defaultValue: "Priser anges inklusive moms om inget annat anges.",
            })}
          </li>
          <li>
            {t("terms.sections.pricesPayment.items.1", {
              defaultValue:
                "Betalningsvillkor: enligt offert/faktura (ex. 10 dagar). Del- eller förskott kan förekomma.",
            })}
          </li>
          <li>
            {t("terms.sections.pricesPayment.items.2", {
              defaultValue: "Eventuella tilläggsarbeten offereras innan utförande.",
            })}
          </li>
        </ul>
      </Section>

      <Section
        id="leverans-frakt"
        title={t("terms.sections.delivery.title", { defaultValue: "Leverans & frakt" })}
      >
        <p className="text-gray-700">
          {t("terms.sections.delivery.body", {
            defaultValue:
              "Fraktkostnad framgår i din offert. Vi levererar normalt i Mälardalen. Trappor/hiss, svåråtkomliga adresser eller särskilda lyft kan medföra tillägg.",
          })}
        </p>
      </Section>

      <Section
        id="angerratt-reklamation"
        title={t("terms.sections.withdrawalClaims.title", { defaultValue: "Ångerrätt & reklamation" })}
      >
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            {t("terms.sections.withdrawalClaims.items.0", {
              defaultValue:
                "Stenskivor tillverkas efter mått och är en specialbeställning. Ångerrätt gäller därför inte efter påbörjad tillverkning.",
            })}
          </li>
          <li>
            {t("terms.sections.withdrawalClaims.items.1.prefix", {
              defaultValue: "Reklamation anmäls skriftligen till",
            })}{" "}
            <a className="underline" href="mailto:info@marmorskivan.se">
              info@marmorskivan.se
            </a>{" "}
            {t("terms.sections.withdrawalClaims.items.1.suffix", {
              defaultValue: "med beskrivning och foton.",
            })}
          </li>
        </ul>

        <p className="text-sm text-gray-500 mt-3">
          {t("terms.updated", { defaultValue: "Senast uppdaterad: 2025-12-30" })}
        </p>
      </Section>
    </div>
  );
}

/* --- SEO-sida (indexerbar) --- */
export default function Villkor() {
  const { t } = useTranslation();

  const toc = [
    { id: "bestallning-offert", label: t("terms.toc.orderQuote", { defaultValue: "Beställning & offert" }) },
    {
      id: "mattning-tillverkning",
      label: t("terms.toc.measureManufactureInstall", { defaultValue: "Måttning, tillverkning & montering" }),
    },
    { id: "priser-betalning", label: t("terms.toc.pricesPayment", { defaultValue: "Priser & betalning" }) },
    { id: "leverans-frakt", label: t("terms.toc.delivery", { defaultValue: "Leverans & frakt" }) },
    { id: "angerratt-reklamation", label: t("terms.toc.withdrawalClaims", { defaultValue: "Ångerrätt & reklamation" }) },
  ];

  return (
    <LegalSeoPage
      title={t("terms.seo.title", { defaultValue: "Avtals- & köpvillkor | Marmorskivan.se" })}
      metaDescription={t("terms.seo.metaDescription", {
        defaultValue:
          "Här sammanfattar vi vad som gäller när du beställer via marmorskivan.se – offert, måttning, tillverkning, montering, betalning, leverans och reklamation.",
      })}
      h1={t("terms.h1", { defaultValue: "Avtals- & köpvillkor" })}
      heroImage="/hero/terms.jpg"
      toc={toc}
      breadcrumbLabel={t("terms.breadcrumb", { defaultValue: "Avtals- & köpvillkor" })}
    >
      <div className="rounded-2xl border bg-white">
        <VillkorContent />
      </div>
    </LegalSeoPage>
  );
}

function Section({ id, title, children }) {
  return (
    <article className="rounded-2xl border bg-white p-6 mb-6">
      <h2 id={id} className="text-xl font-semibold mb-3 scroll-mt-24">
        {title}
      </h2>
      {children}
    </article>
  );
}
