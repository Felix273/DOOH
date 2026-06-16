"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = localStorage.getItem("theme");
      const isLight = stored === "light";
      setLight(isLight);
      document.documentElement.setAttribute("data-theme", isLight ? "light" : "");
    }, 0);

    return () => window.clearTimeout(timeout);
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
      className="theme-toggle"
    >
      {light ? "🌙" : "☀️"}
    </button>
  );
}
