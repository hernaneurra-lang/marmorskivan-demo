// Path: src/lib/render/api.js
/**
 * postRender(payload): POST till ditt API med fallback.
 */
export async function postRender(payload) {
  async function send(url) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let data = null;
    try { data = await res.json(); } catch {}
    return { ok: res.ok && data && (data.imageUrl || data.url), status: res.status, data };
  }

  let r = await send("/api/ai-render");
  if (!r.ok) r = await send("/api/ai-render.php");
  return r;
}
