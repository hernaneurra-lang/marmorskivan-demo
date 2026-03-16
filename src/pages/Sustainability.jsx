import { useTranslation } from "react-i18next";
import LegalSeoPage from "../components/LegalSeoPage";

export default function SustainabilityPage() {
  const { t } = useTranslation();

  const toc = [
    { id: "intro", label: t("sustainability.toc.overview", { defaultValue: "Översikt" }) },
    {
      id: "akrylkomposit",
      label: t("sustainability.toc.acrylicComposite", {
        defaultValue: "Varför vi inte arbetar med akrylkomposit",
      }),
    },
    {
      id: "process",
      label: t("sustainability.toc.process", {
        defaultValue: "Så väljer vi material – steg för steg",
      }),
    },
    { id: "sammanfattning", label: t("sustainability.toc.summary", { defaultValue: "Sammanfattning" }) },
  ];

  return (
    <LegalSeoPage
      title={t("sustainability.seo.title", { defaultValue: "Hållbarhet | Marmorskivan.se" })}
      metaDescription={t("sustainability.seo.metaDescription", {
        defaultValue:
          "Hållbarhet – vår materialfilosofi och urvalsprocess. Så väljer vi leverantörer, begär klimatdata och prioriterar material med lång livslängd.",
      })}
      h1={t("sustainability.h1", {
        defaultValue: "Hållbarhet – vår materialfilosofi och urvalsprocess",
      })}
      heroImage="/hero/hero.jpg"
      toc={toc}
      breadcrumbLabel={t("sustainability.breadcrumb", { defaultValue: "Hållbarhet" })}
    >
      <div className="max-w-4xl">
        <section id="intro" className="space-y-6 text-gray-800 leading-relaxed scroll-mt-24">
          <p>
            {t("sustainability.intro.p1", {
              defaultValue:
                "På Marmorskivan.se arbetar vi långsiktigt med att erbjuda bänkskivor som kombinerar estetik, funktion och hållbarhet. För oss handlar hållbarhet inte bara om hur ett material används – utan lika mycket om hur det bryts, hur det tillverkas, hur länge det håller och vad som händer när det någon gång ska bytas ut.",
            })}
          </p>
          <p>
            {t("sustainability.intro.p2", {
              defaultValue:
                "Vårt mål är att du som kund alltid ska kunna känna trygghet i att de material vi erbjuder är valda med omsorg, med så låg miljöpåverkan som möjligt sett över hela livscykeln.",
            })}
          </p>
        </section>

        <section id="akrylkomposit" className="mt-10 space-y-4 scroll-mt-24">
          <h2 className="text-2xl font-semibold">
            {t("sustainability.acrylicComposite.h2", {
              defaultValue: "Varför vi inte arbetar med akrylbaserade kompositbänkskivor",
            })}
          </h2>

          <p>
            {t("sustainability.acrylicComposite.p1", {
              defaultValue:
                "På marknaden finns det bänkskivematerial som består av en blandning av mineralpulver och akrylplast (PMMA). Ett känt exempel på denna materialtyp är produkter av typen Corian®, även om det finns många liknande alternativ från andra tillverkare. De används ofta där fogfria lösningar eller avancerade former efterfrågas.",
            })}
          </p>

          <p>
            {t("sustainability.acrylicComposite.p2", {
              defaultValue:
                "Materialtypen har fördelar – men efter noggrann hållbarhetsanalys har vi valt att inte arbeta med dessa produkter. Här är varför:",
            })}
          </p>

          <ol className="list-decimal list-inside space-y-3">
            <li>
              <strong>
                {t("sustainability.acrylicComposite.reasons.1.title", {
                  defaultValue: "Hög klimatpåverkan i råmaterialet",
                })}
              </strong>
              <p className="mt-1">
                {t("sustainability.acrylicComposite.reasons.1.p1", {
                  defaultValue: "Akrylkompositer tillverkas av två resurstyper:",
                })}
              </p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>
                  {t("sustainability.acrylicComposite.reasons.1.bullets.0", {
                    defaultValue: "Mineralpulver (vanligen aluminiumhydroxid från bauxit)",
                  })}
                </li>
                <li>
                  {t("sustainability.acrylicComposite.reasons.1.bullets.1", {
                    defaultValue: "Akrylplast (PMMA) – en petroleumbaserad plast",
                  })}
                </li>
              </ul>
              <p className="mt-1">
                {t("sustainability.acrylicComposite.reasons.1.p2", {
                  defaultValue:
                    "Båda kräver energiintensiv råvaruutvinning. Bauxitbrytning sker ofta i stora dagbrott, och akrylplast tillverkas via kemiska processer med höga utsläpp. Detta steg står för en betydande del av materialets klimatavtryck.",
                })}
              </p>
            </li>

            <li>
              <strong>
                {t("sustainability.acrylicComposite.reasons.2.title", {
                  defaultValue: "Energiintensiv industriell tillverkning",
                })}
              </strong>
              <p className="mt-1">
                {t("sustainability.acrylicComposite.reasons.2.p1", {
                  defaultValue:
                    "Till skillnad från natursten, som huvudsakligen sågas och poleras, kräver akrylkompositer:",
                })}
              </p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>{t("sustainability.acrylicComposite.reasons.2.bullets.0", { defaultValue: "upphettning av monomerer" })}</li>
                <li>{t("sustainability.acrylicComposite.reasons.2.bullets.1", { defaultValue: "polymerisation" })}</li>
                <li>{t("sustainability.acrylicComposite.reasons.2.bullets.2", { defaultValue: "gjutning" })}</li>
                <li>{t("sustainability.acrylicComposite.reasons.2.bullets.3", { defaultValue: "härdning" })}</li>
                <li>{t("sustainability.acrylicComposite.reasons.2.bullets.4", { defaultValue: "omfattande slipning" })}</li>
              </ul>
              <p className="mt-1">
                {t("sustainability.acrylicComposite.reasons.2.p2", {
                  defaultValue:
                    "Detta gör att materialet får ett högre CO₂-avtryck per kvadratmeter än sten, keramik och större delen av kvartskomposit.",
                })}
              </p>
            </li>

            <li>
              <strong>
                {t("sustainability.acrylicComposite.reasons.3.title", {
                  defaultValue: "Begränsad återvinningsbarhet i praktiken",
                })}
              </strong>
              <p className="mt-1">
                {t("sustainability.acrylicComposite.reasons.3.p1", {
                  defaultValue: "Tekniskt går materialet att återvinna, men:",
                })}
              </p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>{t("sustainability.acrylicComposite.reasons.3.bullets.0", { defaultValue: "det kräver särskilda anläggningar" })}</li>
                <li>{t("sustainability.acrylicComposite.reasons.3.bullets.1", { defaultValue: "få avfallsbolag tar emot det separat" })}</li>
                <li>{t("sustainability.acrylicComposite.reasons.3.bullets.2", { defaultValue: "transport till specialåtervinnare innebär ytterligare utsläpp" })}</li>
              </ul>
              <p className="mt-1">
                {t("sustainability.acrylicComposite.reasons.3.p2", {
                  defaultValue:
                    "I verkligheten hamnar akrylkomposit oftast som brännbart avfall, vilket innebär att det i slutskedet inte bidrar till ett cirkulärt materialflöde.",
                })}
              </p>
            </li>

            <li>
              <strong>
                {t("sustainability.acrylicComposite.reasons.4.title", {
                  defaultValue: "Plastbaserat material utan biologisk nedbrytbarhet",
                })}
              </strong>
              <p className="mt-1">
                {t("sustainability.acrylicComposite.reasons.4.p1", {
                  defaultValue:
                    "PMMA bryts inte ned naturligt. Det betyder att en kasserad bänkskiva blir ett långlivat avfall — även om den bränns för energiutvinning.",
                })}
              </p>
            </li>

            <li>
              <strong>
                {t("sustainability.acrylicComposite.reasons.5.title", {
                  defaultValue: "Vi prioriterar material med hög mineralhalt och lång livslängd",
                })}
              </strong>
              <p className="mt-1">
                {t("sustainability.acrylicComposite.reasons.5.p1", {
                  defaultValue: "Vår filosofi bygger på material som:",
                })}
              </p>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>{t("sustainability.acrylicComposite.reasons.5.bullets.0", { defaultValue: "är naturligt mineralbaserade" })}</li>
                <li>{t("sustainability.acrylicComposite.reasons.5.bullets.1", { defaultValue: "har låg kemikalietäthet" })}</li>
                <li>{t("sustainability.acrylicComposite.reasons.5.bullets.2", { defaultValue: "är långlivade och reparerbara" })}</li>
                <li>{t("sustainability.acrylicComposite.reasons.5.bullets.3", { defaultValue: "kan återbrukas som helt material eller i byggsammanhang" })}</li>
              </ul>
              <p className="mt-1">
                {t("sustainability.acrylicComposite.reasons.5.p2", {
                  defaultValue: "Akrylkomposit passar inte in i den filosofi vi arbetar efter.",
                })}
              </p>
            </li>
          </ol>

          <p>
            {t("sustainability.acrylicComposite.p3", {
              defaultValue:
                "Det betyder inte att materialet är ”dåligt” – bara att det inte passar in i den hållbarhetsprofil vi valt att stå för.",
            })}
          </p>
        </section>

        <section id="process" className="mt-10 space-y-4 scroll-mt-24">
          <h2 className="text-2xl font-semibold">
            {t("sustainability.process.h2", {
              defaultValue: "Så här väljer vi våra material och leverantörer – steg för steg",
            })}
          </h2>

          <p>
            {t("sustainability.process.p1", {
              defaultValue:
                "För oss är valet av material inte en gissning, och det handlar inte om trender. Det är en strukturerad process där vi utvärderar varje steg i materialets livscykel.",
            })}
          </p>

          <h3 className="text-xl font-semibold mt-4">
            {t("sustainability.process.steps.1.title", {
              defaultValue: "Steg 1 – Definiera användningsområde och faktiska krav",
            })}
          </h3>
          <p>
            {t("sustainability.process.steps.1.body", {
              defaultValue:
                "Varje material måste först bedömas utifrån hur det ska användas: kök, badrum, utomhus, offentlig miljö eller hög slitagegrad. Vi väljer bort material som inte klarar kraven för lång livslängd i verkliga miljöer.",
            })}
          </p>

          <h3 className="text-xl font-semibold mt-4">
            {t("sustainability.process.steps.2.title", {
              defaultValue: "Steg 2 – Begära klimatdata från leverantören",
            })}
          </h3>
          <p>{t("sustainability.process.steps.2.p1", { defaultValue: "Vi begär alltid:" })}</p>
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>{t("sustainability.process.steps.2.bullets.0", { defaultValue: "klimatdata per m² (t.ex. EPD när det finns)" })}</li>
            <li>{t("sustainability.process.steps.2.bullets.1", { defaultValue: "energislag i produktionen (fossilt/förnybart)" })}</li>
            <li>{t("sustainability.process.steps.2.bullets.2", { defaultValue: "råvarornas ursprung" })}</li>
            <li>{t("sustainability.process.steps.2.bullets.3", { defaultValue: "certifieringar och processstandarder" })}</li>
          </ul>
          <p className="mt-1">
            {t("sustainability.process.steps.2.p2", {
              defaultValue: "Leverantörer som inte kan eller vill dela transparent data går bort.",
            })}
          </p>

          <h3 className="text-xl font-semibold mt-4">
            {t("sustainability.process.steps.3.title", { defaultValue: "Steg 3 – Analysera råmaterialet" })}
          </h3>
          <p>{t("sustainability.process.steps.3.p1", { defaultValue: "Vi granskar:" })}</p>
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>{t("sustainability.process.steps.3.bullets.0", { defaultValue: "materialets uppbyggnad" })}</li>
            <li>{t("sustainability.process.steps.3.bullets.1", { defaultValue: "andel mineraler vs syntetiska komponenter" })}</li>
            <li>{t("sustainability.process.steps.3.bullets.2", { defaultValue: "förekomst av plast, harts eller kemikalier" })}</li>
          </ul>
          <p className="mt-1">
            {t("sustainability.process.steps.3.p2", {
              defaultValue:
                "Material med hög mineralhalt och låg grad av petroleumbaserat innehåll prioriteras alltid.",
            })}
          </p>

          <h3 className="text-xl font-semibold mt-4">
            {t("sustainability.process.steps.4.title", {
              defaultValue: "Steg 4 – Utvärdera produktionsmetoder och energiprofil",
            })}
          </h3>
          <p>{t("sustainability.process.steps.4.p1", { defaultValue: "Här tittar vi på:" })}</p>
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>{t("sustainability.process.steps.4.bullets.0", { defaultValue: "hur mycket energi som krävs för att skapa en m²" })}</li>
            <li>{t("sustainability.process.steps.4.bullets.1", { defaultValue: "vilka temperaturer och processer som används" })}</li>
            <li>{t("sustainability.process.steps.4.bullets.2", { defaultValue: "eventuell påverkan på mark, vatten och luft vid produktion" })}</li>
          </ul>
          <p className="mt-1">
            {t("sustainability.process.steps.4.p2", {
              defaultValue: "Sten, keramik och kvartskomposit har här stabila profilvärden som vi kan stå bakom.",
            })}
          </p>

          <h3 className="text-xl font-semibold mt-4">
            {t("sustainability.process.steps.5.title", {
              defaultValue: "Steg 5 – Bedöma logistik och transportpåverkan",
            })}
          </h3>
          <p>{t("sustainability.process.steps.5.p1", { defaultValue: "Vi föredrar material som:" })}</p>
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>{t("sustainability.process.steps.5.bullets.0", { defaultValue: "bryts eller tillverkas inom Europa" })}</li>
            <li>{t("sustainability.process.steps.5.bullets.1", { defaultValue: "kan fraktas effektivt" })}</li>
            <li>{t("sustainability.process.steps.5.bullets.2", { defaultValue: "inte kräver komplex kringtransport eller mellanfabriker" })}</li>
          </ul>
          <p className="mt-1">
            {t("sustainability.process.steps.5.p2", {
              defaultValue: "Transport är en viktig del av klimatet, men sällan större än råvaru- och tillverkningsledet.",
            })}
          </p>

          <h3 className="text-xl font-semibold mt-4">
            {t("sustainability.process.steps.6.title", {
              defaultValue: "Steg 6 – Livslängd, servicebarhet och cirkuläritet",
            })}
          </h3>
          <p>{t("sustainability.process.steps.6.p1", { defaultValue: "Ett hållbart material måste kunna:" })}</p>
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>{t("sustainability.process.steps.6.bullets.0", { defaultValue: "hålla i många år" })}</li>
            <li>{t("sustainability.process.steps.6.bullets.1", { defaultValue: "repareras när det behövs" })}</li>
            <li>{t("sustainability.process.steps.6.bullets.2", { defaultValue: "återbrukas i sin helhet" })}</li>
            <li>{t("sustainability.process.steps.6.bullets.3", { defaultValue: "i sista hand återvinnas som mineraliskt restmaterial" })}</li>
          </ul>
          <p className="mt-1">
            {t("sustainability.process.steps.6.p2", { defaultValue: "Mineralbaserade material uppfyller detta bäst." })}
          </p>

          <h3 className="text-xl font-semibold mt-4">
            {t("sustainability.process.steps.7.title", {
              defaultValue: "Steg 7 – Leverantörens transparens och ansvar",
            })}
          </h3>
          <p>
            {t("sustainability.process.steps.7.p1", {
              defaultValue: "Vi samarbetar endast med leverantörer som är öppna med:",
            })}
          </p>
          <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
            <li>{t("sustainability.process.steps.7.bullets.0", { defaultValue: "produktionens miljöpåverkan" })}</li>
            <li>{t("sustainability.process.steps.7.bullets.1", { defaultValue: "arbetsförhållanden" })}</li>
            <li>{t("sustainability.process.steps.7.bullets.2", { defaultValue: "energianvändning" })}</li>
            <li>{t("sustainability.process.steps.7.bullets.3", { defaultValue: "hantering av spillmaterial" })}</li>
          </ul>
          <p className="mt-1">
            {t("sustainability.process.steps.7.p2", {
              defaultValue: "Transparens är en förutsättning för ett långsiktigt samarbete.",
            })}
          </p>
        </section>

        <section id="sammanfattning" className="mt-10 space-y-4 scroll-mt-24">
          <h2 className="text-2xl font-semibold">
            {t("sustainability.summary.h2", {
              defaultValue: "Sammanfattning – vårt ansvar är att välja klokt",
            })}
          </h2>
          <p>
            {t("sustainability.summary.p1", {
              defaultValue:
                "Att erbjuda hållbara material är inte bara en tjänst – det är ett ansvar. Genom att välja bort vissa material (t.ex. akrylbaserade kompositbänkskivor som Corian® och liknande) och fokusera på natursten, keramik och kvartskomposit, säkerställer vi en lägre klimatpåverkan och en mer långsiktig materialekonomi.",
            })}
          </p>
          <p>
            {t("sustainability.summary.p2", {
              defaultValue:
                "Vi vill att varje kund ska känna sig trygg med att valen bakom sortimentet är gjorda med omtanke, fakta och långsiktig hållbarhet som utgångspunkt.",
            })}
          </p>

          <p className="text-sm text-gray-500 mt-6">
            {t("sustainability.updated", { defaultValue: "Senast uppdaterad: 2026-01-01" })}
          </p>
        </section>
      </div>
    </LegalSeoPage>
  );
}
