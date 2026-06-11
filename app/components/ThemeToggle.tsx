"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isLight = stored === "light";
    setLight(isLight);
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "");
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.setAttribute("data-theme", next ? "light" : "");
    localStorage.setItem("theme", next ? "light" : "dark");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light mode"
      style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999, width: "2.5rem", height: "2.5rem", borderRadius: "9999px", border: "1px solid var(--border-default)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "1.1rem", cursor: "pointer" }}
    >
      {light ? "🌙" : "☀️"}
    </button>
  );
}
