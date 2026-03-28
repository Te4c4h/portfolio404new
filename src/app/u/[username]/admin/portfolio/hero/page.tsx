"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Toast from "@/components/Toast";

interface Section {
  id: string;
  name: string;
  slug: string;
}

export default function HeroPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const [headline, setHeadline] = useState("");
  const [subtext, setSubtext] = useState("");
  const [ctaLabel1, setCtaLabel1] = useState("");
  const [ctaTarget1, setCtaTarget1] = useState("");
  const [ctaLabel2, setCtaLabel2] = useState("");
  const [ctaTarget2, setCtaTarget2] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  const load = useCallback(async () => {
    const [siteRes, secRes] = await Promise.all([
      fetch("/api/site"),
      fetch("/api/sections"),
    ]);
    const d = await siteRes.json();
    if (d) {
      setHeadline(d.headline || "");
      setSubtext(d.subtext || "");
      setCtaLabel1(d.ctaLabel1 || "");
      setCtaTarget1(d.ctaTarget1 || "");
      setCtaLabel2(d.ctaLabel2 || "");
      setCtaTarget2(d.ctaTarget2 || "");
    }
    setSections(await secRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline, subtext, ctaLabel1, ctaTarget1, ctaLabel2, ctaTarget2 }),
    });
    setSaving(false);
    setToast(true);
  };

  const ctaOptions = [
    { value: "", label: "Auto (first section)" },
    { value: "#about", label: "About" },
    ...sections.map((s) => ({ value: `#${s.slug}`, label: s.name })),
    { value: "#contact", label: "Contact" },
    ...(isAdmin ? [
      { value: "/login", label: "Login / Sign Up page" },
      { value: "/login#signup", label: "Sign Up page" },
    ] : []),
  ];

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Hero</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Hero Section</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Headline</label>
              <input className="dash-input" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Welcome to my portfolio" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Subtext</label>
              <input className="dash-input" value={subtext} onChange={(e) => setSubtext(e.target.value)} placeholder="A short description" />
            </div>
          </div>
        </div>

        {/* Hero Buttons */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Hero Buttons</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Primary CTA Label</label>
              <input className="dash-input" value={ctaLabel1} onChange={(e) => setCtaLabel1(e.target.value)} placeholder="View Projects" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Primary CTA Target</label>
              <select className="dash-input" value={ctaTarget1} onChange={(e) => setCtaTarget1(e.target.value)}>
                {ctaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Secondary CTA Label</label>
              <input className="dash-input" value={ctaLabel2} onChange={(e) => setCtaLabel2(e.target.value)} placeholder="Contact Me" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Secondary CTA Target</label>
              <select className="dash-input" value={ctaTarget2} onChange={(e) => setCtaTarget2(e.target.value)}>
                {ctaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <Toast message="Hero saved!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
