"use client";

import { useEffect, useRef } from "react";
import type { ContentItemData } from "./PortfolioClient";

interface CodeCardProps {
  item: ContentItemData;
  accent: string;
  surface: string;
}

export default function CodeCard({ item, accent, surface }: CodeCardProps) {
  const tags = item.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    // Dynamically load highlight.js from CDN
    if (!item.codeContent) return;

    const linkId = "hljs-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
      document.head.appendChild(link);
    }

    const scriptId = "hljs-script";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      // Already loaded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).hljs && codeRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).hljs.highlightElement(codeRef.current.querySelector("code"));
      }
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
    script.onload = () => {
      if (codeRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).hljs.highlightElement(codeRef.current.querySelector("code"));
      }
    };
    document.head.appendChild(script);
  }, [item.codeContent, item.codeLanguage]);

  return (
    <div
      className="group rounded-xl overflow-hidden border transition-all duration-300 h-full flex flex-col"
      style={{ backgroundColor: surface, borderColor: surface }}
    >
      <div className="relative flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: `${accent}20` }}>
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: accent }}>
            {item.codeLanguage || "code"}
          </span>
        </div>
        <pre
          ref={codeRef}
          className="overflow-x-auto p-4 text-xs leading-relaxed max-h-[300px]"
          style={{ backgroundColor: "transparent", margin: 0 }}
        >
          <code className={item.codeLanguage ? `language-${item.codeLanguage}` : ""}>
            {item.codeContent}
          </code>
        </pre>
      </div>
      <div className="p-4 border-t flex-1 flex flex-col" style={{ borderColor: `${accent}10` }}>
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
