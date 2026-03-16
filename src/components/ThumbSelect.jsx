// src/components/ThumbSelect.jsx
import React, { useCallback, useMemo, useRef, useEffect } from "react";

/**
 * ThumbSelect
 * Props:
 *  - label?: string
 *  - value: string
 *  - onChange: (newValue: string) => void
 *  - options: Array<{ value: string, label: string, img?: string, desc?: string, priceAdd?: number }>
 *  - columns?: number (default 3)
 */
export default function ThumbSelect({
  label,
  value,
  onChange,
  options = [],
  columns = 3,
}) {
  const itemsRef = useRef([]);

  const selectedIndex = useMemo(
    () => Math.max(0, options.findIndex((o) => o.value === value)),
    [options, value]
  );

  const selectAt = useCallback(
    (i) => {
      const item = options[i];
      if (item && onChange) onChange(item.value);
    },
    [options, onChange]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
          " ",
          "Enter",
        ].includes(e.key)
      )
        return;
      e.preventDefault();

      const count = options.length;
      const cols = Math.max(1, columns);

      let next = selectedIndex;

      switch (e.key) {
        case "Home":
          next = 0;
          break;
        case "End":
          next = count - 1;
          break;
        case "ArrowLeft":
          next = Math.max(0, selectedIndex - 1);
          break;
        case "ArrowRight":
          next = Math.min(count - 1, selectedIndex + 1);
          break;
        case "ArrowUp":
          next = Math.max(0, selectedIndex - cols);
          break;
        case "ArrowDown":
          next = Math.min(count - 1, selectedIndex + cols);
          break;
        case " ":
        case "Enter":
          selectAt(selectedIndex);
          return;
        default:
          return;
      }

      // flytta fokus
      itemsRef.current[next]?.focus();
    },
    [columns, options.length, selectedIndex, selectAt]
  );

  useEffect(() => {
    // se till att refs har rätt längd
    itemsRef.current = itemsRef.current.slice(0, options.length);
  }, [options.length]);

  return (
    <div className="w-full">
      {label ? (
        <div className="text-xs text-gray-600 mb-1">{label}</div>
      ) : null}

      <div
        className={`
          grid gap-3
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-${Math.max(2, columns)}
        `}
        role="radiogroup"
        aria-label={label || "val"}
        onKeyDown={onKeyDown}
      >
        {options.map((opt, i) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              ref={(el) => (itemsRef.current[i] = el)}
              role="radio"
              aria-checked={active}
              onClick={() => selectAt(i)}
              className={[
                "text-left rounded-2xl border p-3 transition",
                "focus:outline-none focus:ring-2 focus:ring-black/30",
                active ? "border-black shadow-sm" : "hover:border-gray-300",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                {opt.img ? (
                  <img
                    src={opt.img}
                    alt={opt.label}
                    className="w-14 h-14 rounded-xl border object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl border grid place-items-center text-xs text-gray-500">
                    —
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-medium truncate">{opt.label}</div>
                  {opt.desc ? (
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {opt.desc}
                    </div>
                  ) : null}
                  {typeof opt.priceAdd === "number" ? (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {opt.priceAdd === 0
                        ? "Inget pristillägg"
                        : `Tillägg ca ${formatCurrency(opt.priceAdd)}/st`}
                    </div>
                  ) : null}
                </div>
                <div
                  className={[
                    "ml-auto w-5 h-5 rounded-full border grid place-items-center",
                    active ? "bg-black text-white border-black" : "",
                  ].join(" ")}
                  aria-hidden
                >
                  {active ? "✓" : ""}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatCurrency(n) {
  try {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return `${n} kr`;
  }
}
