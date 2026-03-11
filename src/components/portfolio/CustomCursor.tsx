"use client";

import { useEffect, useState, useRef } from "react";

interface CustomCursorProps {
  cursorColor: string;
}

export default function CustomCursor({ cursorColor }: CustomCursorProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const outer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setVisible(true);
    document.documentElement.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (innerRef.current) {
        innerRef.current.style.left = e.clientX + "px";
        innerRef.current.style.top = e.clientY + "px";
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role=button], input, select, textarea, [data-clickable]")) {
        setHovering(true);
      }
    };

    const onOut = () => setHovering(false);

    let raf: number;
    const animate = () => {
      outer.current.x += (mouse.current.x - outer.current.x) * 0.15;
      outer.current.y += (mouse.current.y - outer.current.y) * 0.15;
      if (outerRef.current) {
        outerRef.current.style.left = outer.current.x + "px";
        outerRef.current.style.top = outer.current.y + "px";
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!visible) return null;

  const size = hovering ? 48 : 32;
  const dotSize = hovering ? 0 : 6;

  return (
    <>
      <div
        ref={outerRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[width,height] duration-200"
        style={{
          width: size,
          height: size,
          borderColor: cursorColor,
          boxShadow: `0 0 ${hovering ? 16 : 8}px ${cursorColor}40`,
        }}
      />
      <div
        ref={innerRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,opacity] duration-200"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: cursorColor,
          opacity: hovering ? 0 : 1,
        }}
      />
      <style>{`
        @media (hover: hover) {
          * { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
