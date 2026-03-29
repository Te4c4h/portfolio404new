"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  heading: string;
  subtitle: string;
  accent: string;
  headingFont: string;
  headingColor?: string;
  headingFontOverride?: string;
  headingWeight?: string;
  subColor?: string;
  subFont?: string;
  subWeight?: string;
  bgColor?: string;
  duration?: number;
}

export default function LoadingScreen({
  heading, subtitle, accent, headingFont,
  headingColor, headingFontOverride, headingWeight,
  subColor, subFont, subWeight, bgColor, duration,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const ms = ((duration && duration > 0) ? duration : 2.5) * 1000 - 300;

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), ms);
    return () => clearTimeout(t);
  }, [ms]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: bgColor || "var(--bg)" }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-6xl font-bold"
            style={{
              fontFamily: (headingFontOverride || headingFont) + ", sans-serif",
              color: headingColor || "var(--text)",
              fontWeight: headingWeight || undefined,
            }}
          >
            {heading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl mt-2 font-medium"
            style={{
              color: subColor || accent,
              fontFamily: subFont ? subFont + ", sans-serif" : undefined,
              fontWeight: subWeight || undefined,
            }}
          >
            {subtitle}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
