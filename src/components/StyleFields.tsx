"use client";

const fonts = [
  "Inter", "Syne", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat",
  "Raleway", "Nunito", "Work Sans", "DM Sans", "Plus Jakarta Sans",
  "Space Grotesk", "Outfit", "Manrope", "Archivo", "Barlow",
];

const weights = [
  { value: "", label: "Default" },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  return (
    <div>
      <label className="text-xs text-[var(--muted)] mb-1 block">
        {label}
        {value && (
          <button onClick={() => onChange("")} className="ml-2 text-[var(--accent)] text-xs hover:underline">Clear</button>
        )}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer"
        />
        <input
          className="dash-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Inherit from theme"
        />
      </div>
    </div>
  );
}

interface FontSelectorProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}

export function FontSelector({ label = "Font", value, onChange }: FontSelectorProps) {
  return (
    <div>
      <label className="text-xs text-[var(--muted)] mb-1 block">{label}</label>
      <select className="dash-input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Inherit from theme</option>
        {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
    </div>
  );
}

interface FontWeightSelectorProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}

export function FontWeightSelector({ label = "Font Weight", value, onChange }: FontWeightSelectorProps) {
  return (
    <div>
      <label className="text-xs text-[var(--muted)] mb-1 block">{label}</label>
      <select className="dash-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {weights.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
      </select>
    </div>
  );
}

interface TextStyleGroupProps {
  colorLabel: string;
  colorValue: string;
  onColorChange: (v: string) => void;
  fontValue: string;
  onFontChange: (v: string) => void;
  weightValue: string;
  onWeightChange: (v: string) => void;
}

export function TextStyleGroup({
  colorLabel, colorValue, onColorChange,
  fontValue, onFontChange,
  weightValue, onWeightChange,
}: TextStyleGroupProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
      <ColorPickerField label={colorLabel} value={colorValue} onChange={onColorChange} />
      <FontSelector value={fontValue} onChange={onFontChange} />
      <FontWeightSelector value={weightValue} onChange={onWeightChange} />
    </div>
  );
}

interface CharLimitHintProps {
  max: number;
  current?: number;
}

export function CharLimitHint({ max, current }: CharLimitHintProps) {
  const over = current !== undefined && current > max;
  return (
    <p className={`text-[10px] mt-0.5 ${over ? "text-[var(--danger)]" : "text-[var(--muted)]"}`}>
      Max {max} characters{current !== undefined ? ` (${current}/${max})` : ""}
    </p>
  );
}
