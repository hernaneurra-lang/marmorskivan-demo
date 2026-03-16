import { useTranslation } from "react-i18next";
import LegalSeoPage from "../components/LegalSeoPage";

/* --- Content-komponent (modal) --- */
export function UnderhallContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 p-6">
      <article className="rounded-2xl border bg-white p-6" id="intro">
        <h2 className="text-xl font-semibold mb-3">
          {t("maintenance.intro.title", { defaultValue: "Underhåll & skötsel" })}
        </h2>
        <p className="text-gray-700">
          {t("maintenance.intro.body", {
            defaultValue:
              "Rätt skötsel förlänger livslängden och bevarar utseendet. Här är våra korta råd per material.",
          })}
        </p>
      </article>

      <article className="rounded-2xl border bg-white p-6" id="daglig-rengoring">
        <h3 className="font-semibold mb-2">
          {t("maintenance.daily.title", { defaultValue: "Daglig rengöring – generella tips" })}
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>
              {t("maintenance.daily.items.0.strong", { defaultValue: "Milt diskmedel + ljummet vatten" })}
            </strong>{" "}
            {t("maintenance.daily.items.0.rest", { defaultValue: "räcker oftast. Torka torrt." })}
          </li>
          <li>
            {t("maintenance.daily.items.1", {
              defaultValue: "Undvik slipmedel, stålull, syror och klorhaltiga produkter.",
            })}
          </li>
          <li>
            {t("maintenance.daily.items.2", {
              defaultValue: "Använd skärbräda; undvik att sätta varma kärl direkt på ytan.",
            })}
          </li>
        </ul>
      </article>

      <section className="grid md:grid-cols-2 gap-6" id="rad-per-material">
        <Tile title={t("maintenance.tiles.graniteQuartzite.title", { defaultValue: "Granit & kvartsit" })}>
          {t("maintenance.tiles.graniteQuartzite.body", {
            defaultValue:
              "Täta ytan vid behov (1–2 ggr/år beroende på användning). Torka upp spill snabbt, särskilt oljor och vin.",
          })}
        </Tile>

        <Tile title={t("maintenance.tiles.marbleLimestone.title", { defaultValue: "Marmor & kalksten" })}>
          {t("maintenance.tiles.marbleLimestone.body", {
            defaultValue:
              "Syrakänsliga – undvik citron, vinäger och vin. Använd pH-neutralt rengöringsmedel och torka torrt.",
          })}
        </Tile>

        <Tile title={t("maintenance.tiles.composite.title", { defaultValue: "Komposit (kvartskomposit)" })}>
          {t("maintenance.tiles.composite.body", {
            defaultValue:
              "Låg porositet och enkel vardagsskötsel. Undvik starka lösningsmedel och permanent värme från kastruller.",
          })}
        </Tile>

        <Tile title={t("maintenance.tiles.ceramic.title", { defaultValue: "Keramik / Dekton / Porcelanico" })}>
          {t("maintenance.tiles.ceramic.body", {
            defaultValue:
              "Mycket tåligt mot värme och repor. Undvik hårda slag mot kanter. Rengör med milt medel.",
          })}
        </Tile>
      </section>

      <article className="rounded-2xl border bg-white p-6" id="flackguide">
        <h3 className="text-xl font-semibold mb-3">
          {t("maintenance.stainGuide.title", { defaultValue: "Fläckguide (snabb)" })}
        </h3>

        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>{t("maintenance.stainGuide.items.0.strong", { defaultValue: "Fett:" })}</strong>{" "}
            {t("maintenance.stainGuide.items.0.rest", {
              defaultValue: "diskmedel med avfettning, låt verka kort, torka torrt.",
            })}
          </li>
          <li>
            <strong>{t("maintenance.stainGuide.items.1.strong", { defaultValue: "Rödvin/kaffe:" })}</strong>{" "}
            {t("maintenance.stainGuide.items.1.rest", {
              defaultValue: "pH-neutralt medel, undvik syror, upprepa vid behov.",
            })}
          </li>
          <li>
            <strong>{t("maintenance.stainGuide.items.2.strong", { defaultValue: "Kalk:" })}</strong>{" "}
            {t("maintenance.stainGuide.items.2.rest", {
              defaultValue: "mikrofiber + varmt vatten; undvik syror särskilt på marmor/kalksten.",
            })}
          </li>
        </ul>

        <p className="text-sm text-gray-500 mt-3">
          {t("maintenance.help.prefix", { defaultValue: "Behöver du råd? Maila" })}{" "}
          <a className="underline" href="mailto:info@marmorskivan.se">
            info@marmorskivan.se
          </a>
        </p>

        <p className="text-sm text-gray-500 mt-3">
          {t("maintenance.updated", { defaultValue: "Senast uppdaterad: 2025-12-30" })}
        </p>
      </article>
    </div>
  );
}

/* --- SEO-sida (indexerbar) --- */
export default function Underhall() {
  const { t } = useTranslation();

  const toc = [
    { id: "intro", label: t("maintenance.toc.overview", { defaultValue: "Översikt" }) },
    { id: "daglig-rengoring", label: t("maintenance.toc.daily", { defaultValue: "Daglig rengöring" }) },
    { id: "rad-per-material", label: t("maintenance.toc.perMaterial", { defaultValue: "Råd per material" }) },
    { id: "flackguide", label: t("maintenance.toc.stainGuide", { defaultValue: "Fläckguide" }) },
  ];

  return (
    <LegalSeoPage
      title={t("maintenance.seo.title", { defaultValue: "Underhåll & skötsel | Marmorskivan.se" })}
      metaDescription={t("maintenance.seo.metaDescription", {
        defaultValue:
          "Snabba och praktiska råd för att hålla stenbänkskivor fina länge – daglig rengöring, materialråd och fläckguide.",
      })}
      h1={t("maintenance.h1", { defaultValue: "Underhåll & skötsel" })}
      heroImage="/hero/care.jpg"
      toc={toc}
      breadcrumbLabel={t("maintenance.breadcrumb", { defaultValue: "Underhåll & skötsel" })}
    >
      <div className="rounded-2xl border bg-white">
        <UnderhallContent />
      </div>
    </LegalSeoPage>
  );
}

function Tile({ title, children }) {
  return (
    <article className="rounded-2xl border bg-white p-6">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-gray-700">{children}</p>
    </article>
  );
}
