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
      className={`flex items-center justify-center gap-2 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors duration-200 border ${
        isDark
          ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20 hover:bg-[var(--accent)]/20"
          : "bg-white text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--foreground)]/5 shadow-sm"
      } ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center"
      >
        {isDark ? <FiMoon size={16} /> : <FiSun size={16} />}
      </motion.div>
      <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}
