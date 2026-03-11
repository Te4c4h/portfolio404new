"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiChevronLeft, FiChevronRight, FiExternalLink, FiGithub } from "react-icons/fi";
import type { ContentItemData } from "./PortfolioClient";

interface ProjectModalProps {
  item: ContentItemData | null;
  onClose: () => void;
  accent: string;
}

export default function ProjectModal({ item, onClose, accent }: ProjectModalProps) {
  const [imgIdx, setImgIdx] = useState(0);

  const images = item
    ? [item.coverImage, item.image1, item.image2, item.image3].filter(Boolean)
    : [];

  useEffect(() => {
    setImgIdx(0);
  }, [item]);

  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") setImgIdx((p) => (p > 0 ? p - 1 : p));
    if (e.key === "ArrowRight") setImgIdx((p) => (p < images.length - 1 ? p + 1 : p));
  }, [onClose, images.length]);

  useEffect(() => {
    if (item) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [item, handleKey]);

  const tags = item ? item.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface)" }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
              style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
            >
              <FiX size={18} />
            </button>

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="relative aspect-video bg-black/30">
                <img
                  src={images[imgIdx]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((p) => (p > 0 ? p - 1 : images.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <FiChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setImgIdx((p) => (p < images.length - 1 ? p + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <FiChevronRight size={18} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className="w-2 h-2 rounded-full transition-colors"
                          style={{
                            backgroundColor: i === imgIdx ? accent : "rgba(255,255,255,0.4)",
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <h2
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
              >
                {item.title}
              </h2>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${accent}15`, color: accent }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {item.description && (
                <p
                  className="text-sm leading-relaxed whitespace-pre-line mb-6"
                  style={{ color: "var(--text)", opacity: 0.8 }}
                >
                  {item.description}
                </p>
              )}

              <div className="flex gap-3">
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                    style={{ backgroundColor: accent, color: "var(--bg)" }}
                  >
                    <FiExternalLink size={14} /> Live Demo
                  </a>
                )}
                {item.repoUrl && (
                  <a
                    href={item.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all hover:scale-105"
                    style={{ borderColor: `${accent}40`, color: "var(--text)" }}
                  >
                    <FiGithub size={14} /> Source Code
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
