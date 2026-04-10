// Lazy-loads and caches materialsInfo.json (662KB) — one fetch per session
let _cache = null;
let _promise = null;

export async function getMaterialsData() {
  if (_cache) return _cache;
  if (!_promise) {
    _promise = fetch("/data/materialsInfo.json")
      .then((r) => r.json())
      .then((data) => {
        _cache = data;
        return data;
      });
  }
  return _promise;
}
