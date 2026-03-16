import { useEffect, useState } from "react";

export default function ImageWithFallback({ candidates = [], alt = "", className = "" }) {
  const [idx, setIdx] = useState(0);
  const src = candidates[idx] || "/products/placeholder.jpg";

  useEffect(() => {
    setIdx(0);
  }, [JSON.stringify(candidates)]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        if (idx < candidates.length - 1) {
          setIdx(idx + 1);
        } else if (!src.includes("placeholder.jpg")) {
          e.currentTarget.src = "/products/placeholder.jpg";
        }
      }}
    />
  );
}
