"use client";

import { motion } from "framer-motion";

interface AboutProps {
  aboutText: string;
  skills: string;
  accent: string;
  surface: string;
  aboutTextColor?: string;
  aboutTextFont?: string;
  aboutTextWeight?: string;
  skillTagBg?: string;
  skillTagColor?: string;
  skillTagFont?: string;
  skillTagWeight?: string;
}

export default function About({ aboutText, skills, accent, surface, aboutTextColor, aboutTextFont, aboutTextWeight, skillTagBg, skillTagColor, skillTagFont, skillTagWeight }: AboutProps) {
  const paragraphs = aboutText.split("\n").filter(Boolean);
  const skillsList = skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.2em] font-semibold mb-8"
          style={{ color: accent }}
        >
          About
        </motion.h2>

        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-base sm:text-lg leading-relaxed mb-4"
            style={{
              color: aboutTextColor || "var(--text)",
              opacity: aboutTextColor ? 1 : 0.85,
              fontFamily: aboutTextFont ? aboutTextFont + ", sans-serif" : undefined,
              fontWeight: aboutTextWeight || undefined,
            }}
          >
            {p}
          </motion.p>
        ))}

        {skillsList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-2 mt-8"
          >
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-default hover:scale-105"
                style={{
                  backgroundColor: skillTagBg || surface,
                  color: skillTagColor || accent,
                  border: `1px solid ${(skillTagColor || accent)}30`,
                  fontFamily: skillTagFont ? skillTagFont + ", sans-serif" : undefined,
                  fontWeight: skillTagWeight || undefined,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = skillTagColor || accent;
                  e.currentTarget.style.color = skillTagBg || "#131313";
                  e.currentTarget.style.borderColor = skillTagColor || accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = skillTagBg || surface;
                  e.currentTarget.style.color = skillTagColor || accent;
                  e.currentTarget.style.borderColor = `${(skillTagColor || accent)}30`;
                }}
              >
                {skill}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
