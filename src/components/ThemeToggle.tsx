"use client";

import { useTheme } from "@/components/ThemeProvider";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors hover:bg-[var(--border)] ${className}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <FiSun size={18} className="text-[var(--muted)]" />
      ) : (
        <FiMoon size={18} className="text-[var(--muted)]" />
      )}
    </button>
  );
}
