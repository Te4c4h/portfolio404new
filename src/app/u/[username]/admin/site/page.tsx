"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FiX, FiPlus } from "react-icons/fi";
import Toast from "@/components/Toast";

interface NavLink {
  id: string;
  label: string;
  href: string;
  order: number;
}

interface SiteData {
  siteTitle: string;
  logoText: string;
  headline: string;
  subtext: string;
  ctaLabel1: string;
  ctaTarget1: string;
  ctaLabel2: string;
  ctaTarget2: string;
  aboutText: string;
  skills: string;
  contactTitle: string;
  contactSubtitle: string;
  footerText: string;
  loadingHeading: string;
  loadingSubtitle: string;
}

interface Section {
  id: string;
  name: string;
  slug: string;
}

const emptySite: SiteData = {
  siteTitle: "", logoText: "", headline: "", subtext: "",
  ctaLabel1: "", ctaTarget1: "", ctaLabel2: "", ctaTarget2: "",
  aboutText: "", skills: "", contactTitle: "", contactSubtitle: "", footerText: "",
  loadingHeading: "", loadingSubtitle: "",
};

export default function SiteContentPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const [site, setSite] = useState<SiteData>(emptySite);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [newLink, setNewLink] = useState({ label: "", href: "" });

  const load = useCallback(async () => {
    const [siteRes, navRes, secRes] = await Promise.all([
      fetch("/api/site"),
      fetch("/api/nav-links"),
      fetch("/api/sections"),
    ]);
    const siteData = await siteRes.json();
    if (siteData) {
      setSite({
        siteTitle: siteData.siteTitle || "",
        logoText: siteData.logoText || "",
        headline: siteData.headline || "",
        subtext: siteData.subtext || "",
        ctaLabel1: siteData.ctaLabel1 || "",
        ctaTarget1: siteData.ctaTarget1 || "",
        ctaLabel2: siteData.ctaLabel2 || "",
        ctaTarget2: siteData.ctaTarget2 || "",
        aboutText: siteData.aboutText || "",
        skills: siteData.skills || "",
        contactTitle: siteData.contactTitle || "",
        contactSubtitle: siteData.contactSubtitle || "",
        footerText: siteData.footerText || "",
        loadingHeading: siteData.loadingHeading || "",
        loadingSubtitle: siteData.loadingSubtitle || "",
      });
    }
    setNavLinks(await navRes.json());
    setSections(await secRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });
    setSaving(false);
    setToast(true);
  };

  const navTargetOptions = [
    { value: "#", label: "Top of page" },
    { value: "#about", label: "About" },
    ...sections.map((s) => ({ value: `#${s.slug}`, label: s.name })),
    { value: "#contact", label: "Contact" },
  ];

  const addNavLink = async () => {
    if (!newLink.label.trim() || !newLink.href) return;
    const r = await fetch("/api/nav-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLink),
    });
    if (r.ok) {
      const link = await r.json();
      setNavLinks((prev) => [...prev, link]);
      setNewLink({ label: "", href: "" });
    }
  };

  const updateNavLinkHref = async (id: string, href: string) => {
    await fetch(`/api/nav-links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ href }),
    });
    setNavLinks((prev) => prev.map((l) => l.id === id ? { ...l, href } : l));
  };

  const deleteNavLink = async (id: string) => {
    await fetch(`/api/nav-links/${id}`, { method: "DELETE" });
    setNavLinks((prev) => prev.filter((l) => l.id !== id));
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

  if (loading) return <div className="text-[#888] text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#fafafa]">Site Content</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#70E844] text-[#131313] hover:bg-[#5ed636] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Loading Screen */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Loading Screen</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Loading Heading</label>
              <input className="dash-input" value={site.loadingHeading} onChange={(e) => setSite((s) => ({ ...s, loadingHeading: e.target.value }))} placeholder="Your Name" />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Loading Subtitle</label>
              <input className="dash-input" value={site.loadingSubtitle} onChange={(e) => setSite((s) => ({ ...s, loadingSubtitle: e.target.value }))} placeholder="Portfolio" />
            </div>
          </div>
        </div>

        {/* Website Title */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Website Title</h2>
          <div>
            <label className="text-xs text-[#888] mb-1 block">Site Title</label>
            <input className="dash-input" value={site.siteTitle} onChange={(e) => setSite((s) => ({ ...s, siteTitle: e.target.value }))} placeholder="My Portfolio" />
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Navigation</h2>
          <div className="mb-4">
            <label className="text-xs text-[#888] mb-1 block">Logo / Brand Text</label>
            <input className="dash-input" value={site.logoText} onChange={(e) => setSite((s) => ({ ...s, logoText: e.target.value }))} placeholder="Your Name" />
            <p className="text-[#555] text-[10px] mt-0.5">If using a logo image, set the URL in Theme &rarr; Branding. Recommended: 200×60px (PNG or SVG, transparent background)</p>
          </div>
          <div className="space-y-2 mb-3">
            {navLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2">
                <input className="dash-input flex-1" value={link.label} readOnly />
                <select
                  className="dash-input flex-1"
                  value={link.href}
                  onChange={(e) => updateNavLinkHref(link.id, e.target.value)}
                >
                  {navTargetOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button onClick={() => deleteNavLink(link.id)} className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#888] hover:text-[#FE454E]">
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input className="dash-input flex-1" value={newLink.label} onChange={(e) => setNewLink((l) => ({ ...l, label: e.target.value }))} placeholder="Label" />
            <select className="dash-input flex-1" value={newLink.href} onChange={(e) => setNewLink((l) => ({ ...l, href: e.target.value }))}>
              <option value="">Select target</option>
              {navTargetOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button onClick={addNavLink} className="p-2 rounded-lg bg-[#70E844] text-[#131313] hover:bg-[#5ed636]">
              <FiPlus size={16} />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Hero Section</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Headline</label>
              <input className="dash-input" value={site.headline} onChange={(e) => setSite((s) => ({ ...s, headline: e.target.value }))} placeholder="Welcome to my portfolio" />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Subtext</label>
              <input className="dash-input" value={site.subtext} onChange={(e) => setSite((s) => ({ ...s, subtext: e.target.value }))} placeholder="A short description" />
            </div>
          </div>
        </div>

        {/* Hero Buttons */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Hero Buttons</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Primary CTA Label</label>
              <input className="dash-input" value={site.ctaLabel1} onChange={(e) => setSite((s) => ({ ...s, ctaLabel1: e.target.value }))} placeholder="View Projects" />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Primary CTA Target</label>
              <select className="dash-input" value={site.ctaTarget1} onChange={(e) => setSite((s) => ({ ...s, ctaTarget1: e.target.value }))}>
                {ctaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Secondary CTA Label</label>
              <input className="dash-input" value={site.ctaLabel2} onChange={(e) => setSite((s) => ({ ...s, ctaLabel2: e.target.value }))} placeholder="Contact Me" />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Secondary CTA Target</label>
              <select className="dash-input" value={site.ctaTarget2} onChange={(e) => setSite((s) => ({ ...s, ctaTarget2: e.target.value }))}>
                {ctaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">About Section</h2>
          <textarea className="dash-input min-h-[120px]" value={site.aboutText} onChange={(e) => setSite((s) => ({ ...s, aboutText: e.target.value }))} placeholder="Tell visitors about yourself..." />
          <p className="text-[#555] text-[10px] mt-1">Supports multiple paragraphs. Use line breaks to separate.</p>
        </div>

        {/* Skills */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Skills</h2>
          <input className="dash-input" value={site.skills} onChange={(e) => setSite((s) => ({ ...s, skills: e.target.value }))} placeholder="React, TypeScript, Product Strategy" />
        </div>

        {/* Contact Section */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Contact Section</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#888] mb-1 block">Contact Title</label>
              <input className="dash-input" maxLength={30} value={site.contactTitle} onChange={(e) => setSite((s) => ({ ...s, contactTitle: e.target.value }))} placeholder="Get in Touch" />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Contact Subtitle</label>
              <input className="dash-input" value={site.contactSubtitle} onChange={(e) => setSite((s) => ({ ...s, contactSubtitle: e.target.value }))} placeholder="I'd love to hear from you" />
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Footer</h2>
          <div>
            <label className="text-xs text-[#888] mb-1 block">Footer Copyright Text</label>
            <input className="dash-input" value={site.footerText} onChange={(e) => setSite((s) => ({ ...s, footerText: e.target.value }))} placeholder="e.g. © 2026 Your Name" />
            <p className="text-[#555] text-[10px] mt-0.5">Leave empty to use default: © [year] [your name]</p>
          </div>
        </div>
      </div>

      <Toast message="Changes saved successfully!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
