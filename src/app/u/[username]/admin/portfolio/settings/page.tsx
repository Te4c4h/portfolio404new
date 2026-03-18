"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Toast from "@/components/Toast";
import dynamic from "next/dynamic";

const RgbaColorPicker = dynamic(() => import("@/components/RgbaColorPicker"), {
  ssr: false,
  loading: () => <div className="h-10 bg-[#2a2a2a] rounded-lg animate-pulse" />,
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
  gridColor: string;
}

const themeDefaults: ThemeData = {
  accentColor: "#70E844", backgroundColor: "#131313", surfaceColor: "#181818",
  textColor: "#fafafa", dangerColor: "#FE454E", cursorColor: "#70E844",
  bodyFont: "Inter", headingFont: "Syne", faviconUrl: "",
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

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  const [siteTitle, setSiteTitle] = useState("");
  const [loadingHeading, setLoadingHeading] = useState("");
  const [loadingSubtitle, setLoadingSubtitle] = useState("");
  const [theme, setTheme] = useState<ThemeData>(themeDefaults);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const [siteRes, themeRes] = await Promise.all([
      fetch("/api/site"),
      fetch("/api/theme"),
    ]);
    const siteData = await siteRes.json();
    if (siteData) {
      setSiteTitle(siteData.siteTitle || "");
      setLoadingHeading(siteData.loadingHeading || "");
      setLoadingSubtitle(siteData.loadingSubtitle || "");
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
        body: JSON.stringify({ siteTitle, loadingHeading, loadingSubtitle }),
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

  if (loading) return <div className="text-[#888] text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#fafafa]">Settings</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#70E844] text-[#131313] hover:bg-[#5ed636] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Website Title */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Website Title</h2>
          <div>
            <label className="text-xs text-[#888] mb-1 block">Site Title</label>
            <input className="dash-input" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="My Portfolio" />
          </div>
        </div>

        {/* Loading Screen */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Loading Screen</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Loading Heading</label>
              <input className="dash-input" value={loadingHeading} onChange={(e) => setLoadingHeading(e.target.value)} placeholder="Your Name" />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Loading Subtitle</label>
              <input className="dash-input" value={loadingSubtitle} onChange={(e) => setLoadingSubtitle(e.target.value)} placeholder="Portfolio" />
            </div>
          </div>
        </div>

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
                    placeholder={themeDefaults[key] as string}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
            <label className="text-xs text-[#888] mb-1 block">Grid Color</label>
            <RgbaColorPicker
              value={theme.gridColor}
              onChange={(val) => setTheme((t) => ({ ...t, gridColor: val }))}
              placeholder="rgba(255,255,255,0.03)"
            />
            <p className="text-[#555] text-[10px] mt-0.5">Background grid overlay color. Use rgba for transparency.</p>
          </div>
        </div>

        {/* Fonts */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Fonts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Live Preview */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Live Preview</h2>
          <div
            className="rounded-lg overflow-hidden border border-[#2a2a2a] p-6 relative"
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
                  <p className="text-[10px] font-medium" style={{ color: theme.textColor }}>Project One</p>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: theme.surfaceColor }}>
                  <div className="w-full h-12 rounded mb-2" style={{ backgroundColor: `${theme.accentColor}15` }} />
                  <div className="flex gap-1 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor }}>TypeScript</span>
                  </div>
                  <p className="text-[10px] font-medium" style={{ color: theme.textColor }}>Project Two</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: `${theme.textColor}15` }}>
                <p className="text-[10px]" style={{ color: theme.dangerColor }}>danger color sample</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone — only for non-admin users */}
        {!isAdmin && (
          <div className="bg-[#181818] border border-[#FE454E]/30 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-[#FE454E] uppercase tracking-wider mb-2">Danger Zone</h2>
            <p className="text-[#888] text-sm mb-4">Permanently delete your account and all portfolio data. This action cannot be undone.</p>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#FE454E]/10 text-[#FE454E] border border-[#FE454E]/30 hover:bg-[#FE454E]/20 transition-colors"
            >
              Delete Account
            </button>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModalOpen(false)}>
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#fafafa] mb-2">Delete Account</h2>
            <p className="text-[#888] text-sm mb-6">Are you sure? This will permanently delete your account and all your portfolio data.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 rounded-lg text-sm bg-[#2a2a2a] text-[#fafafa] hover:bg-[#333]">Cancel</button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  const r = await fetch("/api/user/account", { method: "DELETE" });
                  if (r.ok) {
                    await signOut({ callbackUrl: "/" });
                  } else {
                    setDeleting(false);
                    setDeleteModalOpen(false);
                  }
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#FE454E] text-white hover:bg-[#e03d45] disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message="Settings saved!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
