"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation, Language, languageLabels } from "@/lib/i18n/LanguageProvider";
import { useTheme } from "@/components/ThemeProvider";
import { FiGlobe } from "react-icons/fi";

const languages: Language[] = ["en", "hy", "ru"];
const languageNames: Record<Language, string> = {
  en: "English",
  hy: "Հայերեն",
  ru: "Русский",
};

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useTranslation();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isDark = theme === "dark";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center gap-2 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors duration-200 border ${
          isDark
            ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20 hover:bg-[var(--accent)]/20"
            : "bg-white text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--foreground)]/5 shadow-sm"
        }`}
        title="Change language"
      >
        <FiGlobe size={16} />
        <span>{languageLabels[language]}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50 w-full">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${
                lang === language
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20"
              }`}
            >
              <span className="font-medium text-sm">{languageLabels[lang]}</span>
              <span className="text-xs opacity-70">{languageNames[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
