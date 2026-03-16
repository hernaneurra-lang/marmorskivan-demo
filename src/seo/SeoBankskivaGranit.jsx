// Path: src/seo/SeoBankskivaGranit.jsx
import StoneDetailPage from "../components/StoneDetailPage";

export default function SeoBankskivaGranit() {
  return (
    <StoneDetailPage
      title="Bänkskiva i granit – pris, fördelar & guide | Marmorskivan.se"
      metaDescription="Bänkskiva i granit för kök och badrum. Läs om fördelar, tålighet, underhåll och vad som påverkar pris. Räkna pris och skicka offert i kalkylatorn."
      h1="Bänkskiva i granit – tålig granitskiva för kök och badrum"
      heroImage="/images/materials/Granit/granit-hero.jpg"
      backgroundImage="/images/materials/granit-hero.jpg"
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
                Öppna kalkylatorn och välj granit – ange ungefärliga mått och få pris direkt.
              </div>
              <div class="mt-4 flex gap-3 flex-wrap">
                <a href="/app?cat=Granit" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                  Välj granit i kalkylatorn
                </a>
                <a href="/bankskiva-sten" class="px-5 py-2.5 rounded-xl border bg-white hover:bg-gray-50 font-semibold">
                  Jämför material
                </a>
              </div>
            </div>
          `,
        },
        {
          heading: "Varför välja bänkskiva i granit?",
          content: `
            <p>
              En <strong>bänkskiva i granit</strong> är ett av de mest praktiska valen för kök – slitstarkt, snyggt och ofta lätt att leva med.
              Granit har naturlig karaktär men upplevs i många fall som mer tåligt än marmor.
            </p>
            <ul>
              <li><strong>Hög tålighet</strong> för vardagsbruk</li>
              <li><strong>Naturligt material</strong> med levande struktur</li>
              <li><strong>Många uttryck</strong> – från lugnt till mer livligt</li>
              <li><strong>Passar kök & badrum</strong></li>
            </ul>
          `,
        },
        {
          heading: "Pris på granitbänkskiva – vad påverkar?",
          content: `
            <p>
              Priset styrs främst av <strong>mått</strong>, <strong>tjocklek</strong>, <strong>kantprofil</strong>, <strong>urtag</strong>
              (häll/diskho/blandare) och ev. <strong>stänkskydd</strong>.
            </p>
            <div class="not-prose mt-4 p-4 rounded-2xl border bg-white">
              <div class="font-semibold text-gray-900">Tips</div>
              <p class="text-sm text-gray-700 mt-1">
                Börja med ungefärliga mått – du kan justera senare. Kalkylatorn ger dig snabbt en bra prisnivå.
              </p>
              <a href="/app?cat=Granit" class="inline-flex mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                Beräkna pris på granit
              </a>
            </div>
          `,
        },
        {
          heading: "Granit i kök – bra att veta",
          content: `
            <p>
              Granit är generellt tåligt, men precis som alla stenmaterial mår det bra av rätt skötsel.
              Rengör med milda medel och undvik slipande produkter.
            </p>
            <ul>
              <li>Vanligtvis <strong>lätt att underhålla</strong></li>
              <li>Torka upp spill för bästa långsiktiga finish</li>
              <li>Välj finish efter stil: matt/honed eller polerad</li>
            </ul>
          `,
        },
        {
          heading: "Så går det till – från val till färdig bänkskiva",
          content: `
            <ol>
              <li><strong>Välj granit</strong> i kalkylatorn</li>
              <li><strong>Ange mått</strong> och val (kant, urtag, stänkskydd)</li>
              <li><strong>Skicka offert</strong> – vi återkommer med nästa steg</li>
            </ol>
          `,
        },
        {
          heading: "Vanliga frågor",
          content: `
            <p><strong>Är granit bättre än marmor i kök?</strong><br/>
              Många väljer granit för tålighet och enkel vardag. Marmor väljs ofta mer för uttryck och exklusiv känsla.
            </p>
            <p><strong>Kan jag få urtag för diskho och häll?</strong><br/>
              Ja, urtag/håltagningar kan anpassas efter din lösning.
            </p>
            <p><strong>Hur får jag pris på granit?</strong><br/>
              Räkna pris direkt i kalkylatorn utifrån dina mått och val.
            </p>
          `,
        },
      ]}
    />
  );
}
