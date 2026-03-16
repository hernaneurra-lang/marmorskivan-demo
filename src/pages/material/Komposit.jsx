// ===== FIL: src/pages/material/Komposit.jsx =====
import { useTranslation } from "react-i18next";
import StoneDetailPage from "../../components/StoneDetailPage";

export default function Komposit() {
  const { t } = useTranslation();

  return (
    <StoneDetailPage
      title={t("materialPages.composite.seo.title", {
        defaultValue:
          "Kompositbänkskivor – Köpa komposit till kök & badrum | Skötsel, tålighet & fakta | Marmorskivan.se",
      })}
      metaDescription={t("materialPages.composite.seo.metaDescription", {
        defaultValue:
          "Kompositbänkskivor i kvarts – djupguide om uppbyggnad, tillverkning, värmetålighet, UV, dimensioner, kanter, fogar, hygien, certifieringar och skötsel.",
      })}
      h1={t("materialPages.composite.h1", {
        defaultValue:
          "Komposit – Allt om kompositbänkskivor i kvarts: uppbyggnad, tillverkning & skötsel",
      })}
      heroImage="/images/materials/Komposit/komposit-hero.jpg"
      backgroundImage="/images/materials/komposit-hero.jpg"
      textSize="lg"
      sections={[
        {
          heading: t("materialPages.composite.sections.what.heading", {
            defaultValue: "Vad är komposit (kvartskomposit)?",
          }),
          content: t("materialPages.composite.sections.what.content", {
            defaultValue: `
              <p><strong>Komposit</strong> (även kallat <em>engineered stone</em> eller kvartskomposit) är en industriframställd skiva som till cirka <strong>90–95% består av krossad kvarts</strong> blandat med <strong>bindemedel (harts)</strong>, pigment och ibland spegelskärvor eller glas för effekt. 
              Resultatet blir en <strong>mycket slitstark, tät och hygienisk</strong> bänkskiva med jämn kvalitet och förutsägbara egenskaper.</p>

              <p>Jämfört med natursten är komposit:<br/>
              – <strong>tätare och mer fläckresistent</strong> (behöver normalt inte impregneras)<br/>
              – <strong>enklare att matcha i färg</strong> mellan skivor/partier<br/>
              – <strong>lättskött</strong> i vardagen (pH-neutrala medel räcker)</p>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.manufacturing.heading", {
            defaultValue: "Hur tillverkas komposit – steg för steg",
          }),
          content: t("materialPages.composite.sections.manufacturing.content", {
            defaultValue: `
              <ol>
                <li><strong>Urval & krossning:</strong> Naturlig kvarts krossas till definierad kornstorlek.</li>
                <li><strong>Blandning:</strong> Kvarts blandas med harts (vanligen polyester), pigment och eventuella dekorinslag.</li>
                <li><strong>Press & vibrokompaktering:</strong> Massan pressas under <em>högt tryck</em> och <em>vakuum/vibration</em> för att minimera porer.</li>
                <li><strong>Härdning:</strong> Skivorna härdas i ugn för styrka och stabilitet.</li>
                <li><strong>Slipning & polering:</strong> Ytan slipas till vald finish (polis, satin/matt m.fl.).</li>
                <li><strong>Kalibrering & kvalitetskontroll:</strong> Tjocklek, planhet, färg och defekter kontrolleras.</li>
              </ol>
              <p>Tillverkning sker globalt. I Europa är <strong>Spanien, Italien, Portugal och Tyskland</strong> stora producentländer; i Asien har <strong>Kina</strong> omfattande kapacitet; även <strong>USA</strong> har inhemsk produktion och vidarebearbetning.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.properties.heading", {
            defaultValue: "Tekniska egenskaper i vardagen",
          }),
          content: t("materialPages.composite.sections.properties.content", {
            defaultValue: `
              <ul>
                <li><strong>Repor:</strong> Komposit är hårt och reptåligt, men använd alltid skärbräda – knivar kan lämna märken och blir dessutom slöa.</li>
                <li><strong>Fläckar:</strong> Den låga porositeten gör materialet motståndskraftigt. Torka upp kaffe, vin, curry och olja snabbt för bästa resultat.</li>
                <li><strong>Värme:</strong> Tål normal köksvärme, men <strong>heta kastruller/plåtar kan orsaka värmechock</strong> eller missfärgning – använd alltid grytunderlägg.</li>
                <li><strong>Syra & kemikalier:</strong> Undvik starka lösningsmedel, ugnsrengöring, färgborttagning och höga pH–produkter – skölj direkt om det hamnar på ytan.</li>
                <li><strong>UV-ljus:</strong> Långvarig exponering kan ge <strong>gulning/blekning</strong>, särskilt på ljusa färger – komposit lämpar sig främst <em>inomhus</em>.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.formatEdges.heading", {
            defaultValue: "Format, tjocklek & kanter",
          }),
          content: t("materialPages.composite.sections.formatEdges.content", {
            defaultValue: `
              <ul>
                <li><strong>Standardtjocklek:</strong> Vanligt är <strong>20 mm</strong> och <strong>30 mm</strong>. Tunnare (12–13 mm) och tjockare varianter förekommer.</li>
                <li><strong>Skivstorlek:</strong> Höga formater minskar antalet fogar, men kontrollera passager (trapphus/dörrar) vid leverans.</li>
                <li><strong>Kantprofiler:</strong> Rakt (fasad), halv- eller helrundad, <em>bevel</em>, <em>ogee</em> m.fl. Rundade kanter är mer stöttåliga.</li>
                <li><strong>Genomsågning & förstärkning:</strong> Långa fria spännvidder, stora utskärningar och tunna skivor kan kräva förstärkning.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.sinkHobSplash.heading", {
            defaultValue: "Diskho, spishäll & stänkskydd",
          }),
          content: t("materialPages.composite.sections.sinkHobSplash.content", {
            defaultValue: `
              <ul>
                <li><strong>Diskho:</strong> Underlimmad ho är vanligt i komposit. Följ tillverkarens råd kring radier och avstånd till kant.</li>
                <li><strong>Spishäll:</strong> Lämna rekommenderade marginaler. Använd värmesköld/underlägg vid gjutjärn och ugnsplåtar.</li>
                <li><strong>Stänkskydd:</strong> Komposit kan användas som stänkskydd (10–20 mm), alternativt kakel eller glas.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.installation.heading", {
            defaultValue: "Installation & underlag",
          }),
          content: t("materialPages.composite.sections.installation.content", {
            defaultValue: `
              <ul>
                <li><strong>Stabilt underlag:</strong> Underskåp ska vara i våg och tillräckligt bärande. Tunga skivor kräver korrekt stöd.</li>
                <li><strong>Fogning:</strong> Skivskarvar limmas/epoxiseras och planfräses för minimal synlighet. Färgmatchade fogmassor används vid behov.</li>
                <li><strong>Rörelsezoner:</strong> Lämna expansionsmarginaler mot väggar/stommar enligt branschpraxis.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.hygiene.heading", {
            defaultValue: "Hygien, säkerhet & certifieringar",
          }),
          content: t("materialPages.composite.sections.hygiene.content", {
            defaultValue: `
              <ul>
                <li><strong>Låg porositet:</strong> Smuts och vätska tränger inte in lika lätt – enkelt att hålla rent.</li>
                <li><strong>Livsmedelskontakt:</strong> Ledande varumärken uppfyller ofta standarder för livsmedelsytor. Kontrollera produktblad.</li>
                <li><strong>Emissioner:</strong> Välj produkter med dokumenterade låga emissioner (t.ex. GREENGUARD/likvärdigt) för god inomhusluft.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.pros.heading", {
            defaultValue: "Fördelar med kompositbänkskivor",
          }),
          content: t("materialPages.composite.sections.pros.content", {
            defaultValue: `
              <ul>
                <li>✅ <strong>Mycket slitstark</strong> – hög reptålighet i vardagen.</li>
                <li>✅ <strong>Låg porositet</strong> – motståndskraftig mot vätskor och fläckar, normalt ingen impregnering.</li>
                <li>✅ <strong>Stort färgutbud</strong> – från heltoner till marmorinspirerade ådringar.</li>
                <li>✅ <strong>Jämn kvalitet</strong> – lätt att beställa matchande skivor/kompletteringar.</li>
                <li>✅ <strong>Hygienisk & lättskött</strong> – pH-neutrala medel räcker vid städning.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.cons.heading", {
            defaultValue: "Nackdelar och begränsningar",
          }),
          content: t("materialPages.composite.sections.cons.content", {
            defaultValue: `
              <ul>
                <li>⚠️ <strong>Värmechock</strong> – undvik att ställa <em>mycket heta</em> föremål direkt på ytan; använd alltid grytunderlägg.</li>
                <li>⚠️ <strong>UV-känslighet</strong> – långvarigt starkt solljus kan påverka färg/glans; bäst lämpad inomhus.</li>
                <li>⚠️ <strong>Kemikalier</strong> – starka lösningsmedel/ugnsspray kan skada; skölj omgående om spill sker.</li>
                <li>⚠️ <strong>Inte naturstensunik</strong> – mönster kan efterlikna sten men saknar helt naturlig variation.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.dailyCare.heading", {
            defaultValue: "Daglig skötsel & fläckguide",
          }),
          content: t("materialPages.composite.sections.dailyCare.content", {
            defaultValue: `
              <p><strong>Dagligen:</strong> Torka av med mjuk trasa och <strong>pH-neutralt</strong> medel eller mild såpa. Skölj och torka torrt.</p>
              <ul>
                <li><strong>Fett/olja:</strong> Diskmedel, låt verka kort och torka rent.</li>
                <li><strong>Kalk:</strong> Torka torrt efter vatten. Mild kalkborttagning kan användas punktvis – skölj noggrant.</li>
                <li><strong>Färgstarka spill</strong> (vin, curry, kaffe): Torka snabbt. Vid behov, låt milt rengöringsmedel verka kort.</li>
                <li><strong>Undvik:</strong> Slipande svampar, starka syror/baser, lösningsmedel, ugnsrengöring – kan matta eller skada bindemedlet.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.faq.heading", {
            defaultValue: "Vanliga frågor",
          }),
          content: t("materialPages.composite.sections.faq.content", {
            defaultValue: `
              <p><strong>Behöver komposit impregneras?</strong><br/> Nej, den låga porositeten gör impregnering onödig i normalbruk.</p>
              <p><strong>Tål komposit värme?</strong><br/> Ja, normal köksvärme – men för <em>heta kastruller/ugnsplåtar</em> ska grytunderlägg användas för att undvika värmechock/missfärgning.</p>
              <p><strong>Är komposit bra för badrum?</strong><br/> Ja, mycket. Den täta ytan gör materialet fukt- och smutsavvisande.</p>
              <p><strong>Blir färgen alltid identisk?</strong><br/> Batchvariationer är små jämfört med natursten, men beställ gärna hela köket från samma parti för perfekt matchning.</p>
              <p><strong>Kan ytan mattas?</strong><br/> Ja, av starka kemikalier eller slipning. Följ skötselråden för att bibehålla glans.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.whereMade.heading", {
            defaultValue: "Var tillverkas kompositskivor?",
          }),
          content: t("materialPages.composite.sections.whereMade.content", {
            defaultValue: `
              <p>Komposit produceras globalt. I Europa dominerar <strong>Spanien, Italien, Portugal och Tyskland</strong>. 
              I <strong>Kina</strong> finns stora exportinriktade fabriker, och i <strong>USA</strong> sker både produktion och vidarebearbetning för projektmarknaden.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.summary.heading", {
            defaultValue: "Sammanfattning – när är komposit rätt val?",
          }),
          content: t("materialPages.composite.sections.summary.content", {
            defaultValue: `
              <p>Välj komposit när du vill ha en <strong>slitstark, tät, hygienisk</strong> bänkskiva med <strong>jämn färg och minimal skötsel</strong>. 
              Du får ett modernt material som fungerar utmärkt i både kök och badrum – förutsatt att du <strong>använder grytunderlägg</strong>, undviker extrema kemikalier och följer <strong>enkla dagliga skötselråd</strong>.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.composite.sections.quickCheck.heading", {
            defaultValue: "Skötsel & underhåll – snabbcheck",
          }),
          content: t("materialPages.composite.sections.quickCheck.content", {
            defaultValue: `
              <ul>
                <li>🧽 Rengör dagligen med pH-neutralt medel och mjuk trasa.</li>
                <li>🔥 Använd alltid grytunderlägg för mycket heta föremål.</li>
                <li>🌞 Undvik långvarig stark UV-exponering (inomhusplacering).</li>
                <li>🧪 Torka och skölj direkt om stark kemikalie hamnar på ytan.</li>
                <li>🔪 Använd skärbräda – skyddar både kniv och skiva.</li>
              </ul>
            `,
          }),
          images: [
            {
              src: "/images/materials/Komposit/komposit-care.jpg",
              alt: t("materialPages.composite.sections.quickCheck.images.0.alt", {
                defaultValue: "Skötsel av komposit",
              }),
            },
          ],
        },
      ]}
    />
  );
}
