import { useTranslation } from "react-i18next";
import LegalSeoPage from "../components/LegalSeoPage";

/* --- Content-komponent (modal) --- */
export function GarantiContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-2xl border bg-white p-6" id="intro">
        <h2 className="text-lg font-semibold mb-2">
          {t("guarantee.content.intro.title", { defaultValue: "10 års garanti på montering" })}
        </h2>
        <p className="text-gray-700">
          {t("guarantee.content.intro.body", {
            defaultValue:
              "Vi står för våra installationer. Garantin gäller montagearbete och justeringar som kan kopplas till vår montering. Materialets egna egenskaper omfattas av respektive leverantörs villkor.",
          })}
        </p>
      </section>

      <Block
        id="ingar"
        title={t("guarantee.content.includes.title", { defaultValue: "Det här ingår" })}
      >
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>
            {t("guarantee.content.includes.items.0", {
              defaultValue: "Rätt passform mot väggar, skåp och skarvar enligt beställda mått.",
            })}
          </li>
          <li>
            {t("guarantee.content.includes.items.1", {
              defaultValue: "Planlimning/underlimning utförd enligt leverantörens anvisningar.",
            })}
          </li>
          <li>
            {t("guarantee.content.includes.items.2", {
              defaultValue: "Återbesök för justering om monteringen orsakat avvikelsen.",
            })}
          </li>
        </ul>
      </Block>

      <Block
        id="ingar-inte"
        title={t("guarantee.content.excludes.title", { defaultValue: "Det här ingår inte" })}
      >
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          <li>
            {t("guarantee.content.excludes.items.0", {
              defaultValue: "Naturliga variationer i sten (ådring, porer, färgskiftningar).",
            })}
          </li>
          <li>
            {t("guarantee.content.excludes.items.1", {
              defaultValue: "Skador efter montering (värmechock, slag, fel kemikalier).",
            })}
          </li>
          <li>
            {t("guarantee.content.excludes.items.2", {
              defaultValue: "Felaktig/otillräcklig stomme/underlag som påverkar passformen.",
            })}
          </li>
        </ul>
      </Block>

      <Block
        id="arenden"
        title={t("guarantee.content.claims.title", { defaultValue: "Så fungerar garantiärenden" })}
      >
        <ol className="list-decimal ml-5 space-y-1 text-gray-700">
          <li>
            {t("guarantee.content.claims.steps.0.prefix", { defaultValue: "Maila" })}{" "}
            <a href="mailto:info@marmorskivan.se" className="underline">
              info@marmorskivan.se
            </a>{" "}
            {t("guarantee.content.claims.steps.0.suffix", {
              defaultValue: "med ordernummer, bilder och beskrivning.",
            })}
          </li>
          <li>
            {t("guarantee.content.claims.steps.1", {
              defaultValue: "Vi gör en bedömning och bokar ev. hembesök.",
            })}
          </li>
          <li>
            {t("guarantee.content.claims.steps.2", {
              defaultValue: "Åtgärd utförs utan kostnad om ärendet omfattas av garantin.",
            })}
          </li>
        </ol>

        <p className="text-sm text-gray-500 mt-3">
          {t("guarantee.content.updated", {
            defaultValue: "Senast uppdaterad: 2026-01-01",
          })}
        </p>
      </Block>
    </div>
  );
}

/* --- SEO-sida (indexerbar) --- */
export default function Garanti() {
  const { t } = useTranslation();

  const toc = [
    { id: "intro", label: t("guarantee.toc.overview", { defaultValue: "Översikt" }) },
    { id: "ingar", label: t("guarantee.toc.includes", { defaultValue: "Det här ingår" }) },
    { id: "ingar-inte", label: t("guarantee.toc.excludes", { defaultValue: "Det här ingår inte" }) },
    { id: "arenden", label: t("guarantee.toc.claims", { defaultValue: "Garantiärenden" }) },
  ];

  return (
    <LegalSeoPage
      title={t("guarantee.seo.title", { defaultValue: "10 års garanti | Marmorskivan.se" })}
      metaDescription={t("guarantee.seo.metaDescription", {
        defaultValue:
          "Trygghet när du beställer via marmorskivan.se – vad garantin på montering omfattar, vad som inte ingår och hur garantiärenden hanteras.",
      })}
      h1={t("guarantee.h1", { defaultValue: "10 års garanti" })}
      heroImage="/hero/hero.jpg"
      toc={toc}
      breadcrumbLabel={t("guarantee.breadcrumb", { defaultValue: "10 års garanti" })}
    >
      <div className="rounded-2xl border bg-white">
        <GarantiContent />
      </div>
    </LegalSeoPage>
  );
}

function Block({ id, title, children }) {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <h3 id={id} className="text-lg font-semibold mb-2 scroll-mt-24">
        {title}
      </h3>
      {children}
    </section>
  );
}
