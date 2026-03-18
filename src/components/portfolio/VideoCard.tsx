"use client";

import type { ContentItemData } from "./PortfolioClient";

interface VideoCardProps {
  item: ContentItemData;
  accent: string;
  surface: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default function VideoCard({ item, accent, surface }: VideoCardProps) {
  const tags = item.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const embedUrl = getEmbedUrl(item.videoUrl);

  return (
    <div
      className="group rounded-xl overflow-hidden border transition-all duration-300 h-full flex flex-col"
      style={{ backgroundColor: surface, borderColor: surface }}
    >
      <div className="relative overflow-hidden aspect-video bg-black flex-shrink-0">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={item.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: "var(--text)", opacity: 0.5 }}>
            Invalid video URL
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
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
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text)", opacity: 0.6 }}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
