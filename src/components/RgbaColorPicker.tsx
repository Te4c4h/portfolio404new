"use client";

import { useState, useEffect, useCallback } from "react";

interface RgbaColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function parseRgba(val: string): { r: number; g: number; b: number; a: number } {
  const match = val.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }
  return { r: 255, g: 255, b: 255, a: 0.03 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) };
  }
  return { r: 255, g: 255, b: 255 };
}

export default function RgbaColorPicker({ value, onChange, placeholder }: RgbaColorPickerProps) {
  const [rgba, setRgba] = useState(() => parseRgba(value));
  const [textValue, setTextValue] = useState(value);

  useEffect(() => {
    const parsed = parseRgba(value);
    setRgba(parsed);
    setTextValue(value);
  }, [value]);

  const emitChange = useCallback(
    (r: number, g: number, b: number, a: number) => {
      const str = `rgba(${r},${g},${b},${a})`;
      setTextValue(str);
      onChange(str);
    },
    [onChange]
  );

  const handleColorChange = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    setRgba((prev) => ({ ...prev, r, g, b }));
    emitChange(r, g, b, rgba.a);
  };

  const handleAlphaChange = (a: number) => {
    const rounded = Math.round(a * 100) / 100;
    setRgba((prev) => ({ ...prev, a: rounded }));
    emitChange(rgba.r, rgba.g, rgba.b, rounded);
  };

  const handleTextChange = (text: string) => {
    setTextValue(text);
    const parsed = parseRgba(text);
    if (text.match(/rgba?\(/)) {
      setRgba(parsed);
      onChange(text);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={rgbToHex(rgba.r, rgba.g, rgba.b)}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer flex-shrink-0"
        />
        <input
          className="dash-input flex-1"
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder || "rgba(255,255,255,0.03)"}
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-[var(--muted)] w-12 flex-shrink-0">Alpha: {rgba.a}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={rgba.a}
          onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, transparent, ${rgbToHex(rgba.r, rgba.g, rgba.b)})`,
          }}
        />
        <div
          className="w-6 h-6 rounded border border-[var(--border)] flex-shrink-0"
          style={{
            backgroundColor: `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`,
            backgroundImage: "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
          }}
        >
          <div
            className="w-full h-full rounded"
            style={{ backgroundColor: `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})` }}
          />
        </div>
      </div>
    </div>
  );
}
