"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/ImageUpload";
import { CharLimitHint } from "@/components/StyleFields";

const RgbaColorPicker = dynamic(() => import("@/components/RgbaColorPicker"), {
  ssr: false,
  loading: () => <div className="h-10 bg-[var(--border)] rounded-lg animate-pulse" />,
});

interface ThemeData {
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  dangerColor: string;
  cursorColor: string;
  bodyFont: string;
  headingFont: string;
  faviconUrl: string;
  webclipUrl: string;
  logoUrl: string;
  coverImage1: string;
  coverImage2: string;
  coverImage3: string;
  coverImage4: string;
  gridColor: string;
}

const themeDefaults: ThemeData = {
  accentColor: "#70E844", backgroundColor: "#131313", surfaceColor: "#181818",
  textColor: "#fafafa", dangerColor: "#FE454E", cursorColor: "#70E844",
  bodyFont: "Inter", headingFont: "Syne", faviconUrl: "",
  webclipUrl: "", logoUrl: "", coverImage1: "", coverImage2: "", coverImage3: "", coverImage4: "",
  gridColor: "rgba(255,255,255,0.03)",
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

export default function SettingsPage() {
  const [siteTitle, setSiteTitle] = useState("");
  const [theme, setTheme] = useState<ThemeData>(themeDefaults);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  const load = useCallback(async () => {
    const [siteRes, themeRes] = await Promise.all([
      fetch("/api/site"),
      fetch("/api/theme"),
    ]);
    const siteData = await siteRes.json();
    if (siteData) {
      setSiteTitle(siteData.siteTitle || "");
    }
    const themeData = await themeRes.json();
    if (themeData) {
      setTheme({
        accentColor: themeData.accentColor || themeDefaults.accentColor,
        backgroundColor: themeData.backgroundColor || themeDefaults.backgroundColor,
        surfaceColor: themeData.surfaceColor || themeDefaults.surfaceColor,
        textColor: themeData.textColor || themeDefaults.textColor,
        dangerColor: themeData.dangerColor || themeDefaults.dangerColor,
        cursorColor: themeData.cursorColor || themeDefaults.cursorColor,
        bodyFont: themeData.bodyFont || themeDefaults.bodyFont,
        headingFont: themeData.headingFont || themeDefaults.headingFont,
        faviconUrl: themeData.faviconUrl || "",
        webclipUrl: themeData.webclipUrl || "",
        logoUrl: themeData.logoUrl || "",
        coverImage1: themeData.coverImage1 || "",
        coverImage2: themeData.coverImage2 || "",
        coverImage3: themeData.coverImage3 || "",
        coverImage4: themeData.coverImage4 || "",
        gridColor: themeData.gridColor || themeDefaults.gridColor,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      fetch("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteTitle }),
      }),
      fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      }),
    ]);
    setSaving(false);
    setToast(true);
  };

  const updateColor = (key: keyof ThemeData, value: string) => {
    setTheme((t) => ({ ...t, [key]: value }));
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Appearance</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Website Title */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Website Title</h2>
          <div>
            <label className="text-xs text-[var(--muted)] mb-1 block">Site Title</label>
            <input className="dash-input" maxLength={60} value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="My Portfolio" />
            <CharLimitHint max={60} current={siteTitle.length} />
            <p className="text-[var(--muted)] text-[10px] mt-0.5">Shown in the browser tab and search results.</p>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Global Color Palette</h2>
          <p className="text-[var(--muted)] text-[10px] mb-4">These are the default colors used across your entire portfolio. Individual sections can override them.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {colorFields.map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-[var(--muted)] mb-1 block">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme[key] as string}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer"
                  />
                  <input
                    className="dash-input"
                    value={theme[key] as string}
                    onChange={(e) => updateColor(key, e.target.value)}
                    placeholder={themeDefaults[key] as string}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <label className="text-xs text-[var(--muted)] mb-1 block">Grid Color</label>
            <RgbaColorPicker
              value={theme.gridColor}
              onChange={(val) => setTheme((t) => ({ ...t, gridColor: val }))}
              placeholder="rgba(255,255,255,0.03)"
            />
            <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">Background grid overlay color. Use rgba for transparency.</p>
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Global Default Fonts</h2>
          <p className="text-[var(--muted)] text-[10px] mb-4">These fonts apply site-wide. Individual elements can override them in their settings pages.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Body Font</label>
              <select className="dash-input" value={theme.bodyFont} onChange={(e) => setTheme((t) => ({ ...t, bodyFont: e.target.value }))}>
                {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Heading Font</label>
              <select className="dash-input" value={theme.headingFont} onChange={(e) => setTheme((t) => ({ ...t, headingFont: e.target.value }))}>
                {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favicon */}
            <ImageUpload
              label="Favicon"
              value={theme.faviconUrl}
              onChange={(url) => setTheme((t) => ({ ...t, faviconUrl: url }))}
              maxSizeMB={0.5}
              maxDimensions={{ width: 64, height: 64 }}
              acceptedFormats={["ICO", "PNG"]}
              folder="favicons"
            />

            {/* OG Image / Webclip */}
            <ImageUpload
              label="OG Image / Webclip"
              value={theme.webclipUrl}
              onChange={(url) => setTheme((t) => ({ ...t, webclipUrl: url }))}
              maxSizeMB={2}
              recommendedDimensions={{ width: 1200, height: 630 }}
              acceptedFormats={["JPG", "PNG"]}
              folder="og-images"
            />
          </div>
        </div>

      </div>

      <Toast message="Settings saved!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
