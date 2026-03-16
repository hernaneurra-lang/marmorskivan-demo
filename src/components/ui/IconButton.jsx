// Path: src/components/ui/IconButton.jsx
import React from "react";

export default function IconButton({ children, onClick, title, className = "", disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
