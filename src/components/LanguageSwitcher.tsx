"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation, Language, languageLabels } from "@/lib/i18n/LanguageProvider";
import { FiGlobe } from "react-icons/fi";

const languages: Language[] = ["en", "hy", "ru"];
const languageNames: Record<Language, string> = {
  en: "English",
  hy: "Հայերեն",
  ru: "Русский",
};

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useTranslation();
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

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30 transition-colors"
        title="Change language"
      >
        <FiGlobe size={14} />
        {languageLabels[language]}
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50 min-w-[120px]">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors ${
                lang === language
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20"
              }`}
            >
              <span className="font-medium">{languageLabels[lang]}</span>
              <span className="text-[10px] opacity-70">{languageNames[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
