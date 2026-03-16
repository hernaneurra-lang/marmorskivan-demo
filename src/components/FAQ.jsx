// src/components/FAQ.jsx
import { useEffect, useState } from "react";
// OBS: filen ligger i projektroten /content/faq.json enligt vår struktur.
// Vite kan importera JSON från projektroten. Alternativ: flytta till /src/content och ändra sökväg.
import faqData from "../../content/faq.json";

export default function FAQ() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Kan bli mer avancerat (fetch) om ni vill editera utan ombyggnad.
    setItems(Array.isArray(faqData) ? faqData : []);
  }, []);

  if (!items.length) return null;

  return (
    <div className="rounded-2xl border p-5 bg-white/80">
      <h2 className="text-lg font-semibold mb-2">FAQ</h2>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <details key={idx} className="rounded-xl border bg-white px-4 py-3">
            <summary className="cursor-pointer font-medium select-none">{it.question}</summary>
            <div className="mt-2 text-sm text-gray-700 leading-relaxed">
              {Array.isArray(it.answer)
                ? it.answer.map((p, i) => <p key={i} className="mb-2">{p}</p>)
                : <p>{it.answer}</p>}
              {it.tips && it.tips.length > 0 && (
                <ul className="list-disc pl-5 mt-2 text-gray-600">
                  {it.tips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
