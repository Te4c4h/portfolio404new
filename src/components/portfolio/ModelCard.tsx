"use client";

import { useEffect } from "react";
import type { ContentItemData } from "./PortfolioClient";

interface ModelCardProps {
  item: ContentItemData;
  accent: string;
  surface: string;
}

export default function ModelCard({ item, accent, surface }: ModelCardProps) {
  const tags = item.tags.split(",").map((t) => t.trim()).filter(Boolean);

  useEffect(() => {
    // Load model-viewer web component from CDN
    const scriptId = "model-viewer-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      className="group rounded-xl overflow-hidden border transition-all duration-300 h-full flex flex-col"
      style={{ backgroundColor: surface, borderColor: surface }}
    >
      <div className="relative aspect-video bg-black/20 flex-shrink-0">
        {/* @ts-expect-error model-viewer is a web component */}
        <model-viewer
          src={item.modelUrl}
          alt={item.title}
          auto-rotate
          camera-controls
          style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
        />
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
