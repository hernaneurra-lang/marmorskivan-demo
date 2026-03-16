import { useMemo, useState } from "react";
import kommuner from "../kommuner.json";

export default function KommunSelect({ onContinue }) {
  const [form, setForm] = useState({ namn:"", telefon:"", email:"", adress:"", kommun:"", ovrigt:"" });
  const [touched, setTouched] = useState({ kommun:false });
  const options = useMemo(()=> [...kommuner].sort((a,b)=>a.localeCompare(b,"sv")), []);
  const isValidEmail = (v)=> /\S+@\S+\.\S+/.test(v);
  const allValid = form.namn.trim().length>1 && form.telefon.trim().length>5 && isValidEmail(form.email) && form.kommun!=="";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["Namn","namn","För- och efternamn","text"],
          ["Telefon","telefon","07x-xxx xx xx","tel"],
          ["E-post","email","namn@example.se","email"],
        ].map(([label,key,ph,type])=>(
          <label key={key} className="block">
            <span className="text-sm text-gray-700">{label}</span>
            <input type={type} className="w-full rounded-xl border px-3 py-2" placeholder={ph}
              value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})}/>
          </label>
        ))}
        <label className="block md:col-span-2">
          <span className="text-sm text-gray-700">Adress</span>
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Gata 1, Postnr Ort"
            value={form.adress} onChange={(e)=>setForm({...form, adress:e.target.value})}/>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm text-gray-700">Kommun</span>
          <select
            className={`w-full rounded-xl border px-3 py-2 ${touched.kommun && !form.kommun ? "border-red-400" : ""}`}
            value={form.kommun}
            onChange={(e)=>setForm({...form, kommun:e.target.value})}
            onBlur={()=>setTouched(t=>({...t, kommun:true}))}
          >
            <option value="">Välj kommun</option>
            {options.map(k=> <option key={k} value={k}>{k}</option>)}
          </select>
          {touched.kommun && !form.kommun && <p className="text-sm text-red-500 mt-1">Välj en kommun.</p>}
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm text-gray-700">Övrig information / särskilda önskemål</span>
          <textarea rows={3} className="w-full rounded-xl border px-3 py-2"
            value={form.ovrigt} onChange={(e)=>setForm({...form, ovrigt:e.target.value})}/>
        </label>
      </div>

      <div className="pt-2 flex justify-center">
        <button
          type="button"
          className={`px-5 py-3 rounded-xl text-white font-medium ${allValid ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-300 cursor-not-allowed"}`}
          disabled={!allValid}
          onClick={()=> allValid && onContinue?.(form)}
        >
          Gå vidare till kalkylatorn →
        </button>
      </div>
    </div>
  );
}
