"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FiX, FiPlus, FiCheck } from "react-icons/fi";
import Toast from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";
import { ColorPickerField, TextStyleGroup, CharLimitHint } from "@/components/StyleFields";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface NavLink {
  id: string;
  label: string;
  href: string;
  order: number;
  labelColor: string;
  labelFont: string;
  labelWeight: string;
}

interface Section {
  id: string;
  name: string;
  slug: string;
}

export default function NavbarPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const isAdmin = session?.user?.isAdmin === true;
  const [logoText, setLogoText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [useLogoImage, setUseLogoImage] = useState(false);
  const [navScrollBg, setNavScrollBg] = useState("");
  const [logoTextColor, setLogoTextColor] = useState("");
  const [logoTextFont, setLogoTextFont] = useState("");
  const [logoTextWeight, setLogoTextWeight] = useState("");
  const [hamburgerColor, setHamburgerColor] = useState("");
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingLinkId, setSavingLinkId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [newLink, setNewLink] = useState({ label: "", href: "", labelColor: "", labelFont: "", labelWeight: "" });
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
      setNavScrollBg(siteData.navScrollBg || "");
      setLogoTextColor(siteData.logoTextColor || "");
      setLogoTextFont(siteData.logoTextFont || "");
      setLogoTextWeight(siteData.logoTextWeight || "");
      setHamburgerColor(siteData.hamburgerColor || "");
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
      body: JSON.stringify({ logoText, logoUrl, useLogoImage, navScrollBg, logoTextColor, logoTextFont, logoTextWeight, hamburgerColor }),
    });
    setSaving(false);
    setToastMsg(t("navbar.saved"));
    setToast(true);
  };

  const navTargetOptions = [
    { value: "#", label: t("hero.topOfPage") },
    { value: "#about", label: t("sidebar.about") },
    ...sections.map((s) => ({ value: `#${s.slug}`, label: s.name })),
    { value: "#contact", label: "Contact" },
  ];

  const addNavLink = async () => {
    if (!newLink.label.trim()) {
      setToastMsg(t("navbar.enterLabel"));
      setToast(true);
      return;
    }
    if (!newLink.href) {
      setToastMsg(t("navbar.selectTargetError"));
      setToast(true);
      return;
    }
    const r = await fetch("/api/nav-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLink),
    });
    if (r.ok) {
      const link = await r.json();
      setNavLinks((prev) => [...prev, link]);
      setNewLink({ label: "", href: "", labelColor: "", labelFont: "", labelWeight: "" });
      setShowAddRow(false);
    }
  };

  const updateNavLink = (id: string, patch: Partial<NavLink>) => {
    setNavLinks((prev) => prev.map((l) => l.id === id ? { ...l, ...patch } : l));
  };

  const saveNavLink = async (link: NavLink) => {
    setSavingLinkId(link.id);
    await fetch(`/api/nav-links/${link.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: link.label,
        href: link.href,
        labelColor: link.labelColor,
        labelFont: link.labelFont,
        labelWeight: link.labelWeight,
      }),
    });
    setSavingLinkId(null);
    setToastMsg(t("navbar.linkSaved"));
    setToast(true);
  };

  const deleteNavLink = async (id: string) => {
    await fetch(`/api/nav-links/${id}`, { method: "DELETE" });
    setNavLinks((prev) => prev.filter((l) => l.id !== id));
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">{t("common.loading")}</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("navbar.title")}</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? t("common.saving") : t("common.saveChanges")}
        </button>
      </div>

      <div className="space-y-8">
        {/* Sticky Navbar Background */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("navbar.stickyNavbar")}</h2>
          <ColorPickerField label={t("navbar.stickyBgColor")} value={navScrollBg} onChange={setNavScrollBg} />
          <p className="text-[var(--muted)] text-[10px] mt-1">{t("navbar.stickyBgHint")}</p>
          <div className="mt-4">
            <ColorPickerField label={t("navbar.hamburgerColor")} value={hamburgerColor} onChange={setHamburgerColor} />
            <p className="text-[var(--muted)] text-[10px] mt-1">{t("navbar.hamburgerHint")}</p>
          </div>
        </div>

        {/* Logo / Brand Text */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("navbar.logoBrand")}</h2>
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setUseLogoImage(!useLogoImage)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useLogoImage ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${useLogoImage ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
            </button>
            <span className="text-xs text-[var(--muted)]">{useLogoImage ? t("navbar.useLogoImage") : t("navbar.useBrandText")}</span>
          </div>
          {useLogoImage ? (
            <ImageUpload
              label={t("navbar.logoImage")}
              value={logoUrl}
              onChange={(url) => setLogoUrl(url)}
              maxSizeMB={1}
              maxDimensions={{ width: 400, height: 160 }}
              acceptedFormats={["PNG", "SVG", "WEBP"]}
              folder="logos"
            />
          ) : (
            <div>
              <input className="dash-input" maxLength={30} value={logoText} onChange={(e) => setLogoText(e.target.value)} placeholder={t("navbar.brandTextPlaceholder")} />
              <CharLimitHint max={30} current={logoText.length} />
              <TextStyleGroup
                colorLabel="Text Color"
                colorValue={logoTextColor}
                onColorChange={setLogoTextColor}
                fontValue={logoTextFont}
                onFontChange={setLogoTextFont}
                weightValue={logoTextWeight}
                onWeightChange={setLogoTextWeight}
              />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{t("navbar.navLinks")}</h2>
            <button
              onClick={() => setShowAddRow(true)}
              disabled={!isAdmin && navLinks.length >= 4}
              className="p-1.5 rounded-lg bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiPlus size={14} />
            </button>
          </div>
          {navLinks.length === 0 && !showAddRow && (
            <p className="text-[var(--muted)] text-xs text-center py-4">{t("navbar.noLinks")}</p>
          )}
          <div className="space-y-3">
            {navLinks.map((link) => (
              <div key={link.id} className="border border-[var(--border)] rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    className="dash-input flex-1"
                    maxLength={30}
                    value={link.label}
                    onChange={(e) => updateNavLink(link.id, { label: e.target.value })}
                    placeholder={t("navbar.linkLabelPlaceholder")}
                  />
                  <select
                    className="dash-input flex-1"
                    value={link.href}
                    onChange={(e) => updateNavLink(link.id, { href: e.target.value })}
                  >
                    {navTargetOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => saveNavLink(link)}
                    disabled={savingLinkId === link.id}
                    className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--accent)] disabled:opacity-40"
                    title={t("navbar.saveLink")}
                  >
                    <FiCheck size={14} />
                  </button>
                  <button onClick={() => deleteNavLink(link.id)} className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)]">
                    <FiX size={14} />
                  </button>
                </div>
                <TextStyleGroup
                  colorLabel={t("navbar.linkLabelColor")}
                  colorValue={link.labelColor || ""}
                  onColorChange={(v) => updateNavLink(link.id, { labelColor: v })}
                  fontValue={link.labelFont || ""}
                  onFontChange={(v) => updateNavLink(link.id, { labelFont: v })}
                  weightValue={link.labelWeight || ""}
                  onWeightChange={(v) => updateNavLink(link.id, { labelWeight: v })}
                />
              </div>
            ))}
            {showAddRow && (
              <div className="border border-dashed border-[var(--border)] rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    className="dash-input flex-1"
                    maxLength={30}
                    value={newLink.label}
                    onChange={(e) => setNewLink((l) => ({ ...l, label: e.target.value }))}
                    placeholder={t("navbar.linkLabelPlaceholder")}
                  />
                  <select
                    className="dash-input flex-1"
                    value={newLink.href}
                    onChange={(e) => setNewLink((l) => ({ ...l, href: e.target.value }))}
                  >
                    <option value="">{t("navbar.selectTarget")}</option>
                    {navTargetOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={addNavLink}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)]"
                  >
                    {t("navbar.addLink")}
                  </button>
                  <button
                    onClick={() => { setShowAddRow(false); setNewLink({ label: "", href: "", labelColor: "", labelFont: "", labelWeight: "" }); }}
                    className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)]"
                  >
                    <FiX size={14} />
                  </button>
                </div>
                <CharLimitHint max={30} current={newLink.label.length} />
                <TextStyleGroup
                  colorLabel={t("navbar.linkLabelColor")}
                  colorValue={newLink.labelColor}
                  onColorChange={(v) => setNewLink((l) => ({ ...l, labelColor: v }))}
                  fontValue={newLink.labelFont}
                  onFontChange={(v) => setNewLink((l) => ({ ...l, labelFont: v }))}
                  weightValue={newLink.labelWeight}
                  onWeightChange={(v) => setNewLink((l) => ({ ...l, labelWeight: v }))}
                />
              </div>
            )}
          </div>
          {!isAdmin && navLinks.length >= 4 && (
            <p className="text-[var(--muted)] text-[10px] mt-2">{t("navbar.maxLinks")}</p>
          )}
        </div>
      </div>

      <Toast message={toastMsg} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
