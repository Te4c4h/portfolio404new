"use client";

import { FiExternalLink, FiGithub } from "react-icons/fi";
import type { ContentItemData } from "./PortfolioClient";

interface ProjectCardProps {
  item: ContentItemData;
  accent: string;
  surface: string;
  onClick: () => void;
}

export default function ProjectCard({ item, accent, surface, onClick }: ProjectCardProps) {
  const tags = item.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div
      onClick={onClick}
      data-clickable
      className="group rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      style={{
        backgroundColor: surface,
        borderColor: surface,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = surface)}
    >
      {/* Cover image */}
      <div className="relative overflow-hidden aspect-video bg-black/20">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: "var(--text)", opacity: 0.2 }}>
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3
          className="font-semibold text-sm mb-1"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
        >
          {item.title}
        </h3>

        {item.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "var(--text)", opacity: 0.6 }}>
            {item.description}
          </p>
        )}

        <div className="flex gap-2">
          {item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ backgroundColor: accent, color: "var(--bg)" }}
            >
              <FiExternalLink size={12} /> Live
            </a>
          )}
          {item.repoUrl && (
            <a
              href={item.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors"
              style={{ borderColor: `${accent}40`, color: "var(--text)" }}
            >
              <FiGithub size={12} /> Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
