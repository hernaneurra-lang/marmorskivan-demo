// Path: src/components/ui/Skeleton.jsx
import React from "react";

export default function Skeleton({ className = "", style }) {
  return (
    <div
      className={`animate-pulse bg-gray-100 rounded-lg ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
