// Path: src/seo/SeoBankskivaKomposit.jsx
import StoneDetailPage from "../components/StoneDetailPage";

export default function SeoBankskivaKomposit() {
  return (
    <StoneDetailPage
      title="Bänkskiva i kvarts/komposit – pris, fördelar & guide | Marmorskivan.se"
      metaDescription="Bänkskiva i kvarts (komposit) för kök och badrum. Jämn design, stort färgurval och lättskött yta. Räkna pris och skicka offert i kalkylatorn."
      h1="Bänkskiva i kvarts/komposit – jämn design och lättskött yta"
      heroImage="/images/materials/Komposit/Komposit-hero.jpg"
      backgroundImage="/images/materials/komposit-hero.jpg"
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
                Öppna kalkylatorn och välj kvarts/komposit – ange mått och få pris direkt.
              </div>
              <div class="mt-4 flex gap-3 flex-wrap">
                <a href="/app?cat=kvarts-komposit" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                  Välj kvarts/komposit i kalkylatorn
                </a>
                <a href="/bankskiva-sten" class="px-5 py-2.5 rounded-xl border bg-white hover:bg-gray-50 font-semibold">
                  Jämför material
                </a>
              </div>
            </div>
          `,
        },
        {
          heading: "Varför välja bänkskiva i kvarts/komposit?",
          content: `
            <p>
              <strong>Kvarts/komposit</strong> är ett populärt val för dig som vill ha ett <strong>jämnare uttryck</strong>,
              tydliga färgval och ofta en <strong>lättskött yta</strong>. Många väljer komposit när de vill ha ett “designat” resultat.
            </p>
            <ul>
              <li><strong>Jämn design</strong> – kontrollerat uttryck</li>
              <li><strong>Stort urval</strong> av färger och stilar</li>
              <li><strong>Praktiskt</strong> för vardagskök</li>
              <li><strong>Passar modern inredning</strong></li>
            </ul>
          `,
        },
        {
          heading: "Pris på kompositbänkskiva – vad påverkar?",
          content: `
            <p>
              Pris påverkas av <strong>mått</strong>, <strong>tjocklek</strong>, <strong>kantprofil</strong>, <strong>urtag</strong> och <strong>stänkskydd</strong>.
              För exakt pris – räkna på dina mått.
            </p>
            <div class="not-prose mt-4 p-4 rounded-2xl border bg-white">
              <div class="font-semibold text-gray-900">Tips</div>
              <p class="text-sm text-gray-700 mt-1">
                Vill du ha ett mer marmorlika utseende? Jämför även med <a class="underline" href="/bankskiva-marmor">marmor</a>.
              </p>
              <a href="/app?cat=kvarts-komposit" class="inline-flex mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                Beräkna pris på kvarts/komposit
              </a>
            </div>
          `,
        },
        {
          heading: "Kvarts/komposit i kök – bra att veta",
          content: `
            <ul>
              <li>Upplevs ofta som <strong>lättskött</strong></li>
              <li>Rengör med milda medel</li>
              <li>Välj rätt stil: lugnt, stenigt, eller mer marmorerat uttryck</li>
            </ul>
          `,
        },
        {
          heading: "Vanliga frågor",
          content: `
            <p><strong>Är kvarts och komposit samma sak?</strong><br/>
              Ofta används orden tillsammans. I praktiken syftar det vanligtvis på kompositbaserade kvartsytor.
            </p>
            <p><strong>Är komposit bra i kök?</strong><br/>
              Ja, många väljer komposit för jämn design och praktisk vardag.
            </p>
            <p><strong>Hur får jag pris?</strong><br/>
              Räkna pris direkt i kalkylatorn utifrån dina mått och val.
            </p>
          `,
        },
      ]}
    />
  );
}
