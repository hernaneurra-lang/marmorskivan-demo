import fs from "fs";
import path from "path";
import handlerAll from "./index";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  // TODO: auth-check
  try {
    // nolla cache i index.js via global require cache
    delete require.cache[require.resolve("./index")];
    // kalla index för att warm-loada igen
    const _res = { ...res, json: (d)=> res.status(200).json({ ok:true, total:d.total, loadedAt:d.loadedAt }) };
    return handlerAll(req, _res);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "reload failed" });
  }
}
