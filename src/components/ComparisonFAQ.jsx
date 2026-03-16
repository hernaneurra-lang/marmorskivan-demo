// ===== FIL: src/components/ComparisonFAQ.jsx =====
import { useState } from "react";

const faqItems = [
  {
    question: "Vad är skillnaden mellan marmor och granit?",
    answer: "Marmor är en metamorf bergart med tidlös elegans och unika ådringar, men den är mjukare och känsligare för syror och repor. Granit är en magmatisk bergart som är betydligt hårdare, tåligare mot värme och vätskor samt kräver mindre underhåll."
  },
  {
    question: "Är kvartsit bättre än granit?",
    answer: "Ja, kvartsit är ännu hårdare och mer värmetålig än granit. Den har ofta marmorlika ådringar, vilket gör att den kombinerar styrkan från granit med skönheten hos marmor."
  },
  {
    question: "Vad skiljer komposit från natursten?",
    answer: "Komposit består av ca 90–95% krossad kvarts blandat med bindemedel och pigment. Den är mycket jämn, tålig och har låg porositet. Natursten har naturliga variationer och en mer exklusiv känsla."
  },
  {
    question: "Är kalksten och travertin bra alternativ?",
    answer: "Kalksten och travertin är porösa och känsligare än granit och kvartsit, men ger en varm och naturlig känsla. De kräver mer underhåll men är uppskattade för sin klassiska estetik."
  },
  {
    question: "Vad skiljer onyx och semiprecious från andra stenar?",
    answer: "Onyx och semiprecious är exklusiva stenar som ofta är transparenta och kan bakbelysas. De används mest i dekorativa projekt och exklusiva miljöer, inte i vardagskök."
  },
  {
    question: "Är terrazzo och återvunnet glas hållbara alternativ?",
    answer: "Ja, båda materialen är miljövänliga. Terrazzo görs av krossad sten i cement/resin, återvunnet glas av krossat glas med bindemedel. Populära i moderna och hållbara inredningar."
  },
  {
    question: "Vilket material är bäst för kök?",
    answer: "Granit & kvartsit: mest tåliga. Marmor, kalksten & travertin: vackra men känsligare. Komposit: praktiskt och lättskött. Onyx & semiprecious: dekorativa. Terrazzo & återvunnet glas: unika och miljövänliga."
  }
];

export default function ComparisonFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="mt-16 bg-white border-t pt-10">
      <h2 className="text-2xl font-bold mb-6">Jämförelser mellan olika material</h2>
      <div className="space-y-4">
        {faqItems.map((item, i) => (
          <div key={i} className="border rounded-lg shadow-sm">
            <button
              onClick={() => toggle(i)}
              className="w-full text-left px-4 py-3 font-semibold text-lg flex justify-between items-center"
            >
              {item.question}
              <span>{openIndex === i ? "−" : "+"}</span>
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-gray-700">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
