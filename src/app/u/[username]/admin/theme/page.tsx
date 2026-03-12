"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";

interface ThemeData {
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  dangerColor: string;
  cursorColor: string;
  bodyFont: string;
  headingFont: string;
  logoUrl: string;
  faviconUrl: string;
  webclipUrl: string;
  gridColor: string;
}

const defaults: ThemeData = {
  accentColor: "#70E844", backgroundColor: "#131313", surfaceColor: "#181818",
  textColor: "#fafafa", dangerColor: "#FE454E", cursorColor: "#70E844",
  bodyFont: "Inter", headingFont: "Syne", logoUrl: "", faviconUrl: "",
  webclipUrl: "", gridColor: "rgba(255,255,255,0.03)",
};

const fonts = [
  "Inter", "Syne", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat",
  "Raleway", "Nunito", "Work Sans", "DM Sans", "Plus Jakarta Sans",
  "Space Grotesk", "Outfit", "Manrope", "Archivo", "Barlow",
];

const colorFields: { key: keyof ThemeData; label: string }[] = [
  { key: "accentColor", label: "Accent Color" },
  { key: "backgroundColor", label: "Background Color" },
  { key: "surfaceColor", label: "Surface Color" },
  { key: "textColor", label: "Text Color" },
  { key: "dangerColor", label: "Danger Color" },
  { key: "cursorColor", label: "Cursor Color" },
];

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemeData>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/theme");
    const data = await r.json();
    if (data) {
      setTheme({
        accentColor: data.accentColor || defaults.accentColor,
        backgroundColor: data.backgroundColor || defaults.backgroundColor,
        surfaceColor: data.surfaceColor || defaults.surfaceColor,
        textColor: data.textColor || defaults.textColor,
        dangerColor: data.dangerColor || defaults.dangerColor,
        cursorColor: data.cursorColor || defaults.cursorColor,
        bodyFont: data.bodyFont || defaults.bodyFont,
        headingFont: data.headingFont || defaults.headingFont,
        logoUrl: data.logoUrl || "",
        faviconUrl: data.faviconUrl || "",
        webclipUrl: data.webclipUrl || "",
        gridColor: data.gridColor || defaults.gridColor,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    });
    setSaving(false);
    setToast(true);
  };

  const updateColor = (key: keyof ThemeData, value: string) => {
    setTheme((t) => ({ ...t, [key]: value }));
  };

  if (loading) return <div className="text-[#888] text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#fafafa]">Theme</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#70E844] text-[#131313] hover:bg-[#5ed636] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Colors */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {colorFields.map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-[#888] mb-1 block">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme[key] as string}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-9 h-9 rounded border border-[#2a2a2a] bg-transparent cursor-pointer"
                  />
                  <input
                    className="dash-input"
                    value={theme[key] as string}
                    onChange={(e) => updateColor(key, e.target.value)}
                    placeholder={defaults[key] as string}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
            <label className="text-xs text-[#888] mb-1 block">Grid Color</label>
            <input
              className="dash-input"
              value={theme.gridColor}
              onChange={(e) => setTheme((t) => ({ ...t, gridColor: e.target.value }))}
              placeholder="rgba(255,255,255,0.03)"
            />
            <p className="text-[#555] text-[10px] mt-0.5">Background grid overlay color. Use rgba for transparency.</p>
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Fonts</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Body Font</label>
              <select className="dash-input" value={theme.bodyFont} onChange={(e) => setTheme((t) => ({ ...t, bodyFont: e.target.value }))}>
                {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Heading Font</label>
              <select className="dash-input" value={theme.headingFont} onChange={(e) => setTheme((t) => ({ ...t, headingFont: e.target.value }))}>
                {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Branding</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Logo URL</label>
              <input className="dash-input" value={theme.logoUrl} onChange={(e) => setTheme((t) => ({ ...t, logoUrl: e.target.value }))} placeholder="https://..." />
              <p className="text-[#555] text-[10px] mt-0.5">Recommended: 200×60px (PNG or SVG, transparent background)</p>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Favicon URL</label>
              <input className="dash-input" value={theme.faviconUrl} onChange={(e) => setTheme((t) => ({ ...t, faviconUrl: e.target.value }))} placeholder="https://..." />
              <p className="text-[#555] text-[10px] mt-0.5">Recommended: 32×32px or 64×64px (ICO or PNG)</p>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">OG Image / Webclip URL</label>
              <input className="dash-input" value={theme.webclipUrl} onChange={(e) => setTheme((t) => ({ ...t, webclipUrl: e.target.value }))} placeholder="https://..." />
              <p className="text-[#555] text-[10px] mt-0.5">Recommended: 1200×630px (JPG or PNG)</p>
            </div>
          </div>
        </div>
      </div>

      <Toast message="Theme saved successfully!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
