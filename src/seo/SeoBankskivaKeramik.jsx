// Path: src/seo/SeoBankskivaKeramik.jsx
import StoneDetailPage from "../components/StoneDetailPage";

export default function SeoBankskivaKeramik() {
  return (
    <StoneDetailPage
      title="Bänkskiva i keramik – pris, fördelar & guide | Marmorskivan.se"
      metaDescription="Bänkskiva i keramik för kök och badrum. Modern, tålig och lättskött yta. Jämför mot marmor/granit/kvarts och räkna pris i kalkylatorn."
      h1="Bänkskiva i keramik – modern, tålig och lättskött"
      heroImage="/images/materials/Keramik/Keramik-hero.jpg"
      backgroundImage="/images/materials/keramik-hero.jpg"
      textSize="lg"
      breadcrumbMiddleLabel="Guider"
      breadcrumbMiddleTo="/"
      sections={[
        {
          heading: "Snabbt nästa steg",
          content: `
            <div class="not-prose mt-2 p-5 rounded-2xl border bg-emerald-50">
              <div class="font-semibold text-gray-900 text-lg">Snabbt nästa steg</div>
              <div class="text-sm text-gray-700 mt-1">
                Öppna kalkylatorn och välj keramik – ange mått och få pris direkt.
              </div>
              <div class="mt-4 flex gap-3 flex-wrap">
                <a href="/app?cat=Keramik" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                  Välj keramik i kalkylatorn
                </a>
                <a href="/bankskiva-sten" class="px-5 py-2.5 rounded-xl border bg-white hover:bg-gray-50 font-semibold">
                  Jämför material
                </a>
              </div>
            </div>
          `,
        },
        {
          heading: "Varför välja bänkskiva i keramik?",
          content: `
            <p>
              En <strong>bänkskiva i keramik</strong> är ett modernt val som många uppskattar för sin <strong>tålighet</strong>
              och <strong>lättskötta</strong> yta. Keramik kan ge allt från sten- och betongkänsla till mer marmorerade uttryck.
            </p>
            <ul>
              <li><strong>Modern design</strong> – många uttryck</li>
              <li><strong>Tålig yta</strong> för vardag</li>
              <li><strong>Lättskött</strong> – enkel rengöring</li>
              <li><strong>Passar kök & badrum</strong></li>
            </ul>
          `,
        },
        {
          heading: "Pris på keramikbänkskiva – vad påverkar?",
          content: `
            <p>
              Pris beror på <strong>mått</strong>, <strong>tjocklek</strong>, <strong>kant</strong>, <strong>urtag</strong> och <strong>stänkskydd</strong>.
              För exakt pris är kalkylatorn snabbast.
            </p>
            <a href="/app?cat=Keramik" class="not-prose inline-flex mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
              Beräkna pris på keramik
            </a>
          `,
        },
        {
          heading: "Keramik i kök – bra att veta",
          content: `
            <p>
              Keramik är populärt i moderna kök. Välj stil och finish efter hur du vill att ytan ska se ut i verkligheten
              (matt, stenig, marmor-look etc.).
            </p>
          `,
        },
        {
          heading: "Vanliga frågor",
          content: `
            <p><strong>Är keramik bättre än kvarts/komposit?</strong><br/>
              Det beror på preferens. Keramik väljs ofta för modern känsla och tålighet, medan kvarts/komposit ofta väljs för jämn design.
            </p>
            <p><strong>Är keramik lätt att underhålla?</strong><br/>
              Ja, i många fall upplevs keramik som lättskött.
            </p>
            <p><strong>Hur får jag pris?</strong><br/>
              Räkna pris direkt i kalkylatorn utifrån dina mått.
            </p>
          `,
        },
      ]}
    />
  );
}
