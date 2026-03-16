// Path: src/seo/SeoBankskivaTravertin.jsx
import StoneDetailPage from "../components/StoneDetailPage";

export default function SeoBankskivaTravertin() {
  return (
    <StoneDetailPage
      title="Bänkskiva i travertin – pris, stil & guide | Marmorskivan.se"
      metaDescription="Bänkskiva i travertin för kök och badrum. Varm, exklusiv natursten med unik karaktär. Läs för- och nackdelar, skötsel och räkna pris i kalkylatorn."
      h1="Bänkskiva i travertin – varm och exklusiv natursten"
      heroImage="/images/materials/Travertin/Travertin-hero.jpg"
      backgroundImage="/images/materials/travertin-hero.jpg"
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
                Öppna kalkylatorn och filtrera på travertin – ange mått och få en prisnivå direkt.
              </div>
              <div class="mt-4 flex gap-3 flex-wrap">
                <a href="/app?cat=travertin" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                  Välj travertin i kalkylatorn
                </a>
                <a href="/bankskiva-sten" class="px-5 py-2.5 rounded-xl border bg-white hover:bg-gray-50 font-semibold">
                  Jämför material
                </a>
              </div>
            </div>
          `,
        },
        {
          heading: "Varför välja bänkskiva i travertin?",
          content: `
            <p>
              <strong>Travertin</strong> ger en varm, exklusiv känsla med naturlig struktur. Perfekt om du vill ha ett mer
              “soft luxury”-uttryck i kök eller badrum.
            </p>
            <ul>
              <li><strong>Varm ton</strong> – passar beige, trä och jordnära paletter</li>
              <li><strong>Naturlig karaktär</strong> – varje skiva är unik</li>
              <li><strong>Exklusivt uttryck</strong> utan att bli “kallt”</li>
            </ul>
          `,
        },
        {
          heading: "Pris på travertin – vad påverkar?",
          content: `
            <p>
              Pris påverkas av <strong>mått</strong>, <strong>tjocklek</strong>, <strong>kantprofil</strong>,
              <strong>urtag</strong> och ev. <strong>stänkskydd</strong>. För exakt pris är kalkylatorn snabbast.
            </p>
            <a href="/app?cat=travertin" class="not-prose inline-flex mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
              Beräkna pris på travertin
            </a>
          `,
        },
        {
          heading: "Travertin i kök – bra att veta",
          content: `
            <p>
              Travertin är natursten. Precis som marmor kan den kräva lite mer omtanke i vardagen.
              Torka upp spill snabbt och använd mild rengöring.
            </p>
          `,
        },
        {
          heading: "Vanliga frågor",
          content: `
            <p><strong>Är travertin samma som kalksten?</strong><br/>
              Travertin är en typ av kalksten med karakteristisk struktur och varm ton.
            </p>
            <p><strong>Passar travertin i kök?</strong><br/>
              Ja, särskilt om du vill ha varm och exklusiv känsla. Tänk på skötsel som med annan natursten.
            </p>
            <p><strong>Hur får jag pris?</strong><br/>
              Räkna pris i kalkylatorn utifrån dina mått och val.
            </p>
          `,
        },
      ]}
    />
  );
}
