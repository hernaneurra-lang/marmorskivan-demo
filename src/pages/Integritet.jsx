import { useTranslation } from "react-i18next";
import LegalSeoPage from "../components/LegalSeoPage";

/* -------------------------------------------------------
   CONTENT (modal + sida)
------------------------------------------------------- */
export function IntegritetContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 p-6">
      <Section
        id="personuppgiftsansvarig"
        title={t("privacy.sections.controller.title")}
      >
        <p className="text-gray-700">
          {t("privacy.sections.controller.brandLine")}
          <br />
          {t("privacy.sections.controller.orgnr")}
          <br />
          {t("privacy.sections.controller.address")}
          <br />
          {t("privacy.sections.controller.emailLabel")}{" "}
          <a className="underline" href="mailto:info@marmorskivan.se">
            info@marmorskivan.se
          </a>
        </p>
      </Section>

      <Section
        id="vilka-uppgifter"
        title={t("privacy.sections.dataCollected.title")}
      >
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>{t("privacy.sections.dataCollected.items.0")}</li>
          <li>{t("privacy.sections.dataCollected.items.1")}</li>
          <li>{t("privacy.sections.dataCollected.items.2")}</li>
        </ul>
      </Section>

      <Section
        id="varfor"
        title={t("privacy.sections.purpose.title")}
      >
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>{t("privacy.sections.purpose.items.0")}</li>
          <li>{t("privacy.sections.purpose.items.1")}</li>
          <li>{t("privacy.sections.purpose.items.2")}</li>
        </ul>
      </Section>

      <Section
        id="rattslig-grund"
        title={t("privacy.sections.legalBasis.title")}
      >
        <p className="text-gray-700">
          {t("privacy.sections.legalBasis.body")}
        </p>
      </Section>

      <Section
        id="lagring-gallring"
        title={t("privacy.sections.retention.title")}
      >
        <p className="text-gray-700">
          {t("privacy.sections.retention.body")}
        </p>
      </Section>

      <Section
        id="rattigheter"
        title={t("privacy.sections.rights.title")}
      >
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>{t("privacy.sections.rights.items.0")}</li>
          <li>{t("privacy.sections.rights.items.1")}</li>
          <li>{t("privacy.sections.rights.items.2")}</li>
        </ul>

        <p className="text-gray-700 mt-2">
          {t("privacy.sections.rights.contactPrefix")}{" "}
          <a className="underline" href="mailto:info@marmorskivan.se">
            info@marmorskivan.se
          </a>{" "}
          {t("privacy.sections.rights.contactSuffix")}
        </p>

        <p className="text-sm text-gray-500 mt-3">
          {t("privacy.updated")}
        </p>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------
   SEO-SIDA (indexerbar)
------------------------------------------------------- */
export default function Integritet() {
  const { t } = useTranslation();

  const toc = [
    { id: "personuppgiftsansvarig", label: t("privacy.toc.controller") },
    { id: "vilka-uppgifter", label: t("privacy.toc.dataCollected") },
    { id: "varfor", label: t("privacy.toc.purpose") },
    { id: "rattslig-grund", label: t("privacy.toc.legalBasis") },
    { id: "lagring-gallring", label: t("privacy.toc.retention") },
    { id: "rattigheter", label: t("privacy.toc.rights") },
  ];

  return (
    <LegalSeoPage
      title={t("privacy.seo.title")}
      metaDescription={t("privacy.seo.metaDescription")}
      h1={t("privacy.h1")}
      heroImage="/hero/privacy.jpg"
      toc={toc}
      breadcrumbLabel={t("privacy.breadcrumb")}
    >
      <div className="rounded-2xl border bg-white">
        <IntegritetContent />
      </div>
    </LegalSeoPage>
  );
}

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */
function Section({ id, title, children }) {
  return (
    <article className="rounded-2xl border bg-white p-6">
      <h2
        id={id}
        className="text-xl font-semibold mb-3 scroll-mt-24"
      >
        {title}
      </h2>
      {children}
    </article>
  );
}
