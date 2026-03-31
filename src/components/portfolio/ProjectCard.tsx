"use client";

import Image from "next/image";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import type { ContentItemData } from "./PortfolioClient";

interface ProjectCardProps {
  item: ContentItemData;
  accent: string;
  surface: string;
  username: string;
  onClick?: () => void;
}

export default function ProjectCard({ item, accent, surface, username }: ProjectCardProps) {
  const itemHref = item.slug ? `/u/${username}/${item.slug}` : undefined;
  const tags = item.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6);

  return (
    <a
      href={itemHref || "#"}
      data-clickable
      className="group rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer h-full flex flex-col"
      style={{
        backgroundColor: item.cardBg || surface,
        borderColor: item.cardBg || surface,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = item.cardBg || surface)}
    >
      {/* Cover image */}
      <div className="relative overflow-hidden aspect-video bg-black/20">
        {item.coverImage ? (
          <Image
            src={item.coverImage}
            alt={`Cover image for ${item.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: surface }} />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  backgroundColor: item.tagBg || `${accent}15`,
                  color: item.tagColor || accent,
                  fontFamily: item.tagFont ? item.tagFont + ", sans-serif" : undefined,
                  fontWeight: item.tagWeight || undefined,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3
          className="font-semibold text-sm mb-1"
          style={{
            fontFamily: item.titleFont ? item.titleFont + ", sans-serif" : "var(--font-heading)",
            color: item.titleColor || "var(--text)",
            fontWeight: item.titleWeight || undefined,
          }}
        >
          {item.title}
        </h3>

        {item.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{
            color: item.descColor || "var(--text)",
            opacity: item.descColor ? 1 : 0.6,
            fontFamily: item.descFont ? item.descFont + ", sans-serif" : undefined,
            fontWeight: item.descWeight || undefined,
          }}>
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
              style={{
                backgroundColor: item.liveBtnBg || accent,
                color: item.liveBtnColor || "var(--bg)",
                fontFamily: item.liveBtnFont ? item.liveBtnFont + ", sans-serif" : undefined,
                fontWeight: item.liveBtnWeight || undefined,
              }}
            >
              <FiExternalLink size={12} /> View
            </a>
          )}
          {item.repoUrl && (
            <a
              href={item.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors"
              style={{
                borderColor: item.repoBtnBg ? item.repoBtnBg : `${accent}40`,
                color: item.repoBtnColor || "var(--text)",
                backgroundColor: item.repoBtnBg || undefined,
                fontFamily: item.repoBtnFont ? item.repoBtnFont + ", sans-serif" : undefined,
                fontWeight: item.repoBtnWeight || undefined,
              }}
            >
              <FiGithub size={12} /> Source
            </a>
          )}
        </div>
      </div>
    </a>
  );
}
