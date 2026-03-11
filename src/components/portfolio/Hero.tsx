"use client";

import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

interface HeroProps {
  headline: string;
  subtext: string;
  ctaLabel1: string;
  ctaTarget1: string;
  ctaLabel2: string;
  ctaTarget2: string;
  accent: string;
  bg: string;
}

export default function Hero({
  headline, subtext, ctaLabel1, ctaTarget1, ctaLabel2, ctaTarget2, accent, bg,
}: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 2.4 }}
        className="text-4xl sm:text-6xl lg:text-7xl font-bold max-w-4xl leading-tight"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
      >
        {headline}
      </motion.h1>

      {subtext && (
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.6 }}
          className="text-base sm:text-lg mt-6 max-w-2xl"
          style={{ color: "var(--text)", opacity: 0.7 }}
        >
          {subtext}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 2.8 }}
        className="flex flex-wrap gap-4 mt-8"
      >
        {ctaLabel1 && (
          <a
            href={ctaTarget1}
            className="px-7 py-3 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: accent, color: bg }}
          >
            {ctaLabel1}
          </a>
        )}
        {ctaLabel2 && (
          <a
            href={ctaTarget2}
            className="px-7 py-3 rounded-lg text-sm font-semibold border-2 transition-all hover:scale-105"
            style={{ borderColor: accent, color: accent }}
          >
            {ctaLabel2}
          </a>
        )}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2, duration: 0.6 }}
        className="absolute bottom-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <FiChevronDown size={24} style={{ color: accent }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
