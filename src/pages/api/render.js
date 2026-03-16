export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { mode, materialId, shape, dims } = req.body || {};
  // TODO: skicka jobb till renderingskö (Blender/LuxCore) och returnera jobId
  // Här fejk: returnera placeholder-bild-URL
  const url = "/images/renders/example.jpg";
  res.status(200).json({ ok:true, url, mode, materialId, shape, dims, durationMs: 42000 });
}
