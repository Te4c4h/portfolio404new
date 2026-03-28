"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";
import dynamic from "next/dynamic";
import ImageUpload from "@/components/ImageUpload";

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
            <input className="dash-input" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="My Portfolio" />
          </div>
        </div>

        {/* Colors */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Colors</h2>
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
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Fonts</h2>
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
            {/* Logo */}
            <ImageUpload
              label="Logo / Brand Image"
              value={theme.logoUrl}
              onChange={(url) => setTheme((t) => ({ ...t, logoUrl: url }))}
              maxSizeMB={1}
              maxDimensions={{ width: 400, height: 160 }}
              acceptedFormats={["PNG", "SVG"]}
              folder="logos"
            />

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

        {/* Cover Images */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Cover / Gallery Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="Cover Image 1"
              value={theme.coverImage1}
              onChange={(url) => setTheme((t) => ({ ...t, coverImage1: url }))}
              maxSizeMB={3}
              recommendedDimensions={{ width: 1200, height: 675 }}
              acceptedFormats={["JPG", "PNG"]}
              folder="covers"
            />
            <ImageUpload
              label="Cover Image 2"
              value={theme.coverImage2}
              onChange={(url) => setTheme((t) => ({ ...t, coverImage2: url }))}
              maxSizeMB={3}
              recommendedDimensions={{ width: 1200, height: 675 }}
              acceptedFormats={["JPG", "PNG"]}
              folder="covers"
            />
            <ImageUpload
              label="Cover Image 3"
              value={theme.coverImage3}
              onChange={(url) => setTheme((t) => ({ ...t, coverImage3: url }))}
              maxSizeMB={3}
              recommendedDimensions={{ width: 1200, height: 675 }}
              acceptedFormats={["JPG", "PNG"]}
              folder="covers"
            />
            <ImageUpload
              label="Cover Image 4"
              value={theme.coverImage4}
              onChange={(url) => setTheme((t) => ({ ...t, coverImage4: url }))}
              maxSizeMB={3}
              recommendedDimensions={{ width: 1200, height: 675 }}
              acceptedFormats={["JPG", "PNG"]}
              folder="covers"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Live Preview</h2>
          <div
            className="rounded-lg overflow-hidden border border-[var(--border)] p-6 relative"
            style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, fontFamily: `${theme.bodyFont}, sans-serif` }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative z-[1]">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold" style={{ color: theme.textColor }}>Logo</span>
                <div className="flex gap-3 text-xs" style={{ color: `${theme.textColor}80` }}>
                  <span>About</span>
                  <span>Work</span>
                  <span>Contact</span>
                </div>
              </div>
              <h1 className="text-xl font-bold mb-2" style={{ fontFamily: `${theme.headingFont}, sans-serif`, color: theme.textColor }}>
                Hello, I&apos;m a Developer
              </h1>
              <p className="text-xs mb-4" style={{ color: `${theme.textColor}99` }}>
                Building amazing things on the web.
              </p>
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: theme.accentColor, color: theme.backgroundColor }}>
                  View Work
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium border" style={{ borderColor: `${theme.accentColor}40`, color: theme.textColor }}>
                  Contact
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ backgroundColor: theme.surfaceColor }}>
                  <div className="w-full h-12 rounded mb-2" style={{ backgroundColor: `${theme.accentColor}15` }} />
                  <div className="flex gap-1 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor }}>React</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor }}>Next.js</span>
                  </div>
                  <p className="text-[var(--accent)] font-medium" style={{ color: theme.textColor }}>Project One</p>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: theme.surfaceColor }}>
                  <div className="w-full h-12 rounded mb-2" style={{ backgroundColor: `${theme.accentColor}15` }} />
                  <div className="flex gap-1 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor }}>TypeScript</span>
                  </div>
                  <p className="text-[var(--accent)] font-medium" style={{ color: theme.textColor }}>Project Two</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: `${theme.textColor}15` }}>
                <p className="text-[var(--accent)]" style={{ color: theme.dangerColor }}>danger color sample</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Toast message="Settings saved!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
