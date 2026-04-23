"use client";

import { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translateUi } from "@/lib/uiI18n";

export default function ThemeToggle() {
  const { language } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = localStorage.getItem("theme");
    const nextTheme = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    return nextTheme;
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:opacity-90"
    >
      <span suppressHydrationWarning>
        {theme === "dark"
          ? translateUi("Light Mode", language)
          : translateUi("Dark Mode", language)}
      </span>
    </button>
  );
}
