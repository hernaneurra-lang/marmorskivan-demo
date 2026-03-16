import argparse, json, re, unicodedata, difflib
from pathlib import Path

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def strip_accents(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    return "".join(c for c in s if not unicodedata.combining(c))

def norm_key(s: str) -> str:
    if not s:
        return ""
    s = strip_accents(s)
    # Enhetlig separering
    s = s.replace("\\", "_").replace("/", "_").replace("-", "_")
    s = s.replace("–", "_").replace("—", "_")
    # Endast a-z0-9_
    s = re.sub(r"[^A-Za-z0-9_]+", "_", s)
    s = re.sub(r"_+", "_", s)
    return s.strip("_").lower()

def title_to_guess(title: str) -> str:
    # Försök skapa "Blanco_Andano_340_180_U" -> norm_key hanterar resten
    t = (title or "").strip()
    return norm_key(t)

def slug_to_guess(slug: str) -> str:
    return norm_key(slug or "")

def variants_from_guess(g: str):
    """Skapa några varianter: t ex ta bort trailing _u/_if/_f, ta bort enkla suffix, osv."""
    out = {g}
    # Ta bort trailing enstaka bokstav (u/f) eller kort suffix (if)
    out.add(re.sub(r"_(u|f)$", "", g))
    out.add(re.sub(r"_(if|uf)$", "", g))
    # Ta bort alla ensam-bokstavs-token (ibland finns inte U/F i filen)
    out.add(re.sub(r"_(?:[a-zA-Z])(?=_|$)", "", g))
    # Ta även bort dubbla nummerdelar som ibland skrivs olika (t ex 340_180 -> 340180)
    out.add(g.replace("_", ""))  # komprimerad
    return {v for v in out if v}

def build_image_index(img_dir: Path):
    files = []
    for p in img_dir.glob("*"):
        if p.is_file() and p.suffix.lower() in ALLOWED_EXTS:
            files.append(p.name)
    # index: normaliserat_namn_utan_ext -> set(filer)
    idx = {}
    for fn in files:
        stem = Path(fn).stem
        key = norm_key(stem)
        idx.setdefault(key, set()).add(fn)
    return idx, files

def best_fuzzy_match(key: str, all_keys: list, cutoff=0.80):
    if not key:
        return None, 0.0
    # snabb kandidatlista
    candidates = difflib.get_close_matches(key, all_keys, n=3, cutoff=cutoff)
    if not candidates:
        # bredare försök
        best = None
        best_ratio = 0.0
        for k in all_keys:
            r = difflib.SequenceMatcher(None, key, k).ratio()
            if r > best_ratio:
                best_ratio, best = r, k
        return (best, best_ratio) if best_ratio >= cutoff else (None, best_ratio)
    # ta första (bästa)
    best = candidates[0]
    ratio = difflib.SequenceMatcher(None, key, best).ratio()
    return best, ratio

def main():
    ap = argparse.ArgumentParser(description="Autokoppla bildfiler till katalog-JSON.")
    ap.add_argument("--input", required=True, help="t.ex. public/data/catalog/sinks.json")
    ap.add_argument("--img-dir", required=True, help="t.ex. public/products/sinks")
    ap.add_argument("--prefix", default="", help="prefix som sparas i JSON, t.ex. /products/sinks/")
    ap.add_argument("--output", help="om tomt skrivs tillbaka till --input")
    ap.add_argument("--force", action="store_true", help="överskriv befintligt image-fält också")
    ap.add_argument("--dry-run", action="store_true", help="skriv inte fil, visa bara vad som skulle ske")
    ap.add_argument("--cutoff", type=float, default=0.80, help="fuzzy cutoff (0.75–0.95). Default 0.80")
    args = ap.parse_args()

    in_path = Path(args.input)
    out_path = Path(args.output) if args.output else in_path
    img_dir = Path(args.img_dir)

    if not in_path.exists():
        raise SystemExit(f"Hittar inte JSON: {in_path}")
    if not img_dir.exists():
        raise SystemExit(f"Hittar inte bildmapp: {img_dir}")

    data = json.loads(in_path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit("JSON är inte en lista.")

    idx, all_files = build_image_index(img_dir)
    all_norm_keys = list(idx.keys())

    updated = 0
    unchanged = 0
    missing = []

    def store_image(item, filename):
        nonlocal updated, unchanged
        val = f"{args.prefix}{filename}" if args.prefix else filename
        if not item.get("image") or args.force:
            item["image"] = val
            updated += 1
        else:
            unchanged += 1

    for item in data:
        # hoppa om image redan finns och vi inte tvingar
        if item.get("image") and not args.force:
            unchanged += 1
            continue

        title = item.get("title", "")
        slug  = item.get("slug", "")

        guesses = set()
        guesses.add(title_to_guess(title))
        guesses.add(slug_to_guess(slug))
        # varianter för vardera
        gvars = set()
        for g in list(guesses):
            gvars |= variants_from_guess(g)
        guesses |= gvars

        # 1) exaktträff i index
        found = None
        for g in guesses:
            if g in idx:
                # välj kortaste filnamn om flera (oftast samma ändå)
                cand = sorted(idx[g], key=len)[0]
                found = cand
                break

        # 2) fuzzy på varianter om inte hittad
        if not found:
            best = None
            best_ratio = 0.0
            for g in guesses:
                k, r = best_fuzzy_match(g, all_norm_keys, cutoff=args.cutoff)
                if k and r > best_ratio:
                    best = k
                    best_ratio = r
            if best:
                cand = sorted(idx[best], key=len)[0]
                found = cand

        if found:
            store_image(item, found)
        else:
            missing.append({"slug": slug, "title": title})

    # skriv fil
    if args.dry_run:
        print("DRY RUN – ingen fil skrevs.")
    else:
        # backup
        bak = in_path.with_suffix(in_path.suffix + ".bak")
        if out_path == in_path and not bak.exists():
            bak.write_text(in_path.read_text(encoding="utf-8"), encoding="utf-8")
            print(f"Backup skapad: {bak}")
        out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Uppdaterad JSON: {out_path}")

    print(f"Uppdaterade poster: {updated}")
    print(f"Oförändrade poster: {unchanged}")
    print(f"Saknade match: {len(missing)}")
    if missing:
        print("\nKunde inte hitta bild för:")
        for m in missing:
            print(f" - {m['slug']}  |  {m['title']}")
        print("\nTips: sänk/öka --cutoff (t.ex. 0.75) eller lägg manuellt `image` för dessa få.")
        
if __name__ == "__main__":
    main()
