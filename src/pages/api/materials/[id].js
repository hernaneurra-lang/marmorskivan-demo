import handlerAll from "./index";
export default function handler(req, res) {
  // quick reuse of cache via index-handler
  const send = (data) => {
    const id = req.query.id;
    const item = data.items.find(x=> x.id === id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.status(200).json(item);
  };
  // monkey-patch res to intercept data
  const _json = res.json.bind(res);
  res.json = (d)=> send(d);
  return handlerAll(req, res);
}
