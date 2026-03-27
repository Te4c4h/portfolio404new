"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import en from "./translations/en.json";
import hy from "./translations/hy.json";
import ru from "./translations/ru.json";

export type Language = "en" | "hy" | "ru";

const translations: Record<Language, typeof en> = { en, hy, ru };

export const languageLabels: Record<Language, string> = {
  en: "EN",
  hy: "HY",
  ru: "RU",
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function useTranslation() {
  return useContext(LanguageContext);
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language | null;
    if (stored && translations[stored]) {
      setLanguageState(stored);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const result = getNestedValue(
        translations[language] as unknown as Record<string, unknown>,
        key
      );
      if (result === key) {
        return getNestedValue(
          translations.en as unknown as Record<string, unknown>,
          key
        );
      }
      return result;
    },
    [language]
  );

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
