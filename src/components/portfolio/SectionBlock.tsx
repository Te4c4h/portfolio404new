"use client";

import { motion } from "framer-motion";
import ProjectCard from "./ProjectCard";
import VideoCard from "./VideoCard";
import CodeCard from "./CodeCard";
import ModelCard from "./ModelCard";
import type { SectionData, ContentItemData } from "./PortfolioClient";

interface SectionBlockProps {
  section: SectionData;
  accent: string;
  surface: string;
  defaultBg: string;
  onCardClick: (item: ContentItemData) => void;
}

export default function SectionBlock({ section, accent, surface, defaultBg, onCardClick }: SectionBlockProps) {
  const bg = section.backgroundColor && section.backgroundColor !== "#181818"
    ? section.backgroundColor
    : defaultBg;

  return (
    <section
      id={section.slug}
      className="py-24 px-6"
      style={{ backgroundColor: bg }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.2em] font-semibold mb-2"
          style={{ color: accent }}
        >
          {section.label}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
        >
          {section.name}
        </motion.h2>
        {section.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-sm mb-10"
            style={{ color: "var(--text)", opacity: 0.6 }}
          >
            {section.subtitle}
          </motion.p>
        )}
        {!section.subtitle && <div className="mb-10" />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {section.contentItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              {(!item.contentType || item.contentType === "project") && (
                <ProjectCard item={item} accent={accent} surface={surface} onClick={() => onCardClick(item)} />
              )}
              {item.contentType === "video" && (
                <VideoCard item={item} accent={accent} surface={surface} />
              )}
              {item.contentType === "code" && (
                <CodeCard item={item} accent={accent} surface={surface} />
              )}
              {item.contentType === "model3d" && (
                <ModelCard item={item} accent={accent} surface={surface} />
              )}
            </motion.div>
          ))}
        </div>

        {section.contentItems.length === 0 && (
          <p className="text-sm text-center py-12" style={{ color: "var(--text)", opacity: 0.4 }}>
            No items in this section yet.
          </p>
        )}
      </div>
    </section>
  );
}
