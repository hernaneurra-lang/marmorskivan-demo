import { Gem, Ruler, SlidersHorizontal, Mail, PhoneCall, MapPin, FileCheck, CalendarClock, Hammer, RefreshCcw } from "lucide-react";

export default function ProcessSteps() {
  const steps = [
    {
      title: "Välj sten",
      desc: "Bläddra bland våra material och hitta din favorit.",
      Icon: Gem,
    },
    {
      title: "Ange mått & tillval",
      desc: "Fyll i mått och värden och lägg till önskade tillval.",
      Icon: Ruler,
    },
    {
      title: "Offert skickas",
      desc: "Vi får din förfrågan och du får en kopia via e‑post.",
      Icon: Mail,
    },
    {
      title: "Kontakt inom 24 timmar",
      desc: "Vi ringer eller mejlar för att boka en tid för mätning.",
      Icon: PhoneCall,
    },
    {
      title: "Kostnadsfri mätning på plats",
      desc: "Vi kommer ut och mäter just ditt projekt – helt utan kostnad.",
      Icon: MapPin,
    },
    {
      title: "Fast pris – allt inkluderat",
      desc: "Efter genomgång skickar vi en tydlig offert med fast totalpris.",
      Icon: FileCheck,
    },
    {
      title: "Boka montering",
      desc: "När stenen är tillverkad hör vi av oss och bokar montering.",
      Icon: CalendarClock,
    },
    {
      title: "Montering & garanti",
      desc: "Vi monterar och skickar samtidigt ett intyg med 10 års garanti.",
      Icon: Hammer,
    },
    {
      title: "Långsiktig skötsel (valfritt)",
      desc: "Med Bänkskiveskydd återkommer vi två gånger per år för försegling och service.",
      Icon: RefreshCcw,
    },
  ];

  return (
    <section id="process" className="relative z-10 bg-white/85 backdrop-blur border-t">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Så går det till – steg för steg</h2>
          <span className="text-sm text-gray-500">En smidig resa från val till färdig montering</span>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <li key={i} className="relative">
              <StepCard index={i + 1} title={s.title} desc={s.desc} Icon={s.Icon} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StepCard({ index, title, desc, Icon }) {
  return (
    <article
      className="group h-full rounded-2xl border bg-white p-4 flex gap-3 items-start hover:shadow-md transition"
      title={title}
    >
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border flex items-center justify-center">
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
        <span className="absolute -top-2 -right-2 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shadow">
          {index}
        </span>
      </div>
      <div className="min-w-0">
        <h3 className="font-medium leading-snug text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </article>
  );
}
