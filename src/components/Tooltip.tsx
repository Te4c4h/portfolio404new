"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export default function Tooltip({ text, children, position = "top", className = "" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [adjustedPos, setAdjustedPos] = useState(position);
  const tipRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !tipRef.current || !wrapRef.current) return;
    const tip = tipRef.current.getBoundingClientRect();

    if (position === "top" && tip.top < 8) setAdjustedPos("bottom");
    else if (position === "bottom" && tip.bottom > window.innerHeight - 8) setAdjustedPos("top");
    else if (position === "left" && tip.left < 8) setAdjustedPos("right");
    else if (position === "right" && tip.right > window.innerWidth - 8) setAdjustedPos("left");
    else setAdjustedPos(position);
  }, [visible, position]);

  if (!text) return <>{children}</>;

  const posClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      ref={wrapRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={() => setVisible((v) => !v)}
    >
      {children}
      {visible && (
        <div
          ref={tipRef}
          className={`absolute z-[9999] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-normal max-w-[240px] pointer-events-none shadow-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] ${posClasses[adjustedPos]}`}
        >
          {text}
        </div>
      )}
    </div>
  );
}
