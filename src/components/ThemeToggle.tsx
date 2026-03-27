"use client";

import { useTheme } from "@/components/ThemeProvider";
import { FiSun, FiMoon } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center w-[52px] h-[28px] rounded-full transition-colors duration-300 ${
        isDark
          ? "bg-[var(--accent)]/15 border border-[var(--accent)]/30"
          : "bg-[var(--border)] border border-[var(--border)]"
      } ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`flex items-center justify-center w-[22px] h-[22px] rounded-full shadow-sm ${
          isDark
            ? "bg-[var(--accent)] ml-[26px]"
            : "bg-white ml-[3px]"
        }`}
      >
        {isDark ? (
          <FiSun size={12} className="text-[var(--background)]" />
        ) : (
          <FiMoon size={12} className="text-[var(--muted)]" />
        )}
      </motion.span>
    </button>
  );
}
