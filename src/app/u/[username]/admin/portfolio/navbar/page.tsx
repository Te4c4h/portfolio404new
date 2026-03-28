"use client";

import { useEffect, useState, useCallback } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import Toast from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";

interface NavLink {
  id: string;
  label: string;
  href: string;
  order: number;
}

interface Section {
  id: string;
  name: string;
  slug: string;
}

export default function NavbarPage() {
  const [logoText, setLogoText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [useLogoImage, setUseLogoImage] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [newLink, setNewLink] = useState({ label: "", href: "" });
  const [showAddRow, setShowAddRow] = useState(false);

  const load = useCallback(async () => {
    const [siteRes, navRes, secRes] = await Promise.all([
      fetch("/api/site"),
      fetch("/api/nav-links"),
      fetch("/api/sections"),
    ]);
    const siteData = await siteRes.json();
    if (siteData) {
      setLogoText(siteData.logoText || "");
      setLogoUrl(siteData.logoUrl || "");
      setUseLogoImage(siteData.useLogoImage || false);
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
      body: JSON.stringify({ logoText, logoUrl, useLogoImage }),
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

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Navigation</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Logo / Brand Text */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Logo / Brand Text</h2>
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setUseLogoImage(!useLogoImage)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useLogoImage ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${useLogoImage ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
            </button>
            <span className="text-xs text-[var(--muted)]">{useLogoImage ? "Use logo image" : "Use brand text"}</span>
          </div>
          {useLogoImage ? (
            <ImageUpload
              label="Logo Image"
              value={logoUrl}
              onChange={(url) => setLogoUrl(url)}
              maxSizeMB={1}
              maxDimensions={{ width: 400, height: 160 }}
              acceptedFormats={["PNG", "SVG", "WEBP"]}
              folder="logos"
            />
          ) : (
            <div>
              <input className="dash-input" value={logoText} onChange={(e) => setLogoText(e.target.value)} placeholder="Your Name" />
              <p className="text-[var(--muted)] text-[10px] mt-1">Displayed as text in the navbar</p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Navigation Links</h2>
            <button
              onClick={() => { if (navLinks.length < 4) setShowAddRow(true); }}
              disabled={navLinks.length >= 4}
              className="p-1.5 rounded-lg bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiPlus size={14} />
            </button>
          </div>
          {navLinks.length === 0 && !showAddRow && (
            <p className="text-[var(--muted)] text-xs text-center py-4">No navigation links yet. Click + to add one.</p>
          )}
          <div className="space-y-2">
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
                <button onClick={() => deleteNavLink(link.id)} className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)]">
                  <FiX size={14} />
                </button>
              </div>
            ))}
            {showAddRow && (
              <div className="flex items-center gap-2">
                <input className="dash-input flex-1" value={newLink.label} onChange={(e) => setNewLink((l) => ({ ...l, label: e.target.value }))} placeholder="Label" />
                <select className="dash-input flex-1" value={newLink.href} onChange={(e) => setNewLink((l) => ({ ...l, href: e.target.value }))}>
                  <option value="">Select target</option>
                  {navTargetOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  onClick={async () => { await addNavLink(); setShowAddRow(false); }}
                  className="p-1.5 rounded-lg bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)]"
                >
                  <FiPlus size={14} />
                </button>
                <button onClick={() => { setShowAddRow(false); setNewLink({ label: "", href: "" }); }} className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)]">
                  <FiX size={14} />
                </button>
              </div>
            )}
          </div>
          {navLinks.length >= 4 && (
            <p className="text-[var(--muted)] text-[10px] mt-2">Maximum 4 navigation links reached</p>
          )}
        </div>
      </div>

      <Toast message="Navbar saved!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
