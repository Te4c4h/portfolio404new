"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Toast from "@/components/Toast";
import { TextStyleGroup, CharLimitHint } from "@/components/StyleFields";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface Section {
  id: string;
  name: string;
  slug: string;
}

export default function HeroPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
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

  // H-1: Headline & subtext styling
  const [headlineColor, setHeadlineColor] = useState("");
  const [headlineFont, setHeadlineFont] = useState("");
  const [headlineWeight, setHeadlineWeight] = useState("");
  const [subtextColor, setSubtextColor] = useState("");
  const [subtextFont, setSubtextFont] = useState("");
  const [subtextWeight, setSubtextWeight] = useState("");

  // H-2: CTA styling
  const [ctaBg1, setCtaBg1] = useState("");
  const [ctaTextColor1, setCtaTextColor1] = useState("");
  const [ctaFont1, setCtaFont1] = useState("");
  const [ctaWeight1, setCtaWeight1] = useState("");
  const [ctaBg2, setCtaBg2] = useState("");
  const [ctaTextColor2, setCtaTextColor2] = useState("");
  const [ctaFont2, setCtaFont2] = useState("");
  const [ctaWeight2, setCtaWeight2] = useState("");

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
      setHeadlineColor(d.headlineColor || "");
      setHeadlineFont(d.headlineFont || "");
      setHeadlineWeight(d.headlineWeight || "");
      setSubtextColor(d.subtextColor || "");
      setSubtextFont(d.subtextFont || "");
      setSubtextWeight(d.subtextWeight || "");
      setCtaBg1(d.ctaBg1 || "");
      setCtaTextColor1(d.ctaTextColor1 || "");
      setCtaFont1(d.ctaFont1 || "");
      setCtaWeight1(d.ctaWeight1 || "");
      setCtaBg2(d.ctaBg2 || "");
      setCtaTextColor2(d.ctaTextColor2 || "");
      setCtaFont2(d.ctaFont2 || "");
      setCtaWeight2(d.ctaWeight2 || "");
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
      body: JSON.stringify({
        headline, subtext, ctaLabel1, ctaTarget1, ctaLabel2, ctaTarget2,
        headlineColor, headlineFont, headlineWeight,
        subtextColor, subtextFont, subtextWeight,
        ctaBg1, ctaTextColor1, ctaFont1, ctaWeight1,
        ctaBg2, ctaTextColor2, ctaFont2, ctaWeight2,
      }),
    });
    setSaving(false);
    setToast(true);
  };

  const ctaOptions = [
    { value: "", label: t("hero.autoFirstSection") },
    { value: "#about", label: t("sidebar.about") },
    ...sections.map((s) => ({ value: `#${s.slug}`, label: s.name })),
    { value: "#contact", label: "Contact" },
    ...(isAdmin ? [
      { value: "/login", label: "Login / Sign Up page" },
      { value: "/login#signup", label: "Sign Up page" },
    ] : []),
  ];

  if (loading) return <div className="text-[var(--muted)] text-sm">{t("common.loading")}</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("hero.title")}</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? t("common.saving") : t("common.saveChanges")}
        </button>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("hero.heroSection")}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">{t("hero.headline")}</label>
              <input className="dash-input" maxLength={60} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={t("hero.headlinePlaceholder")} />
              <CharLimitHint max={60} current={headline.length} />
              <TextStyleGroup
                colorLabel="Text Color" colorValue={headlineColor} onColorChange={setHeadlineColor}
                fontValue={headlineFont} onFontChange={setHeadlineFont}
                weightValue={headlineWeight} onWeightChange={setHeadlineWeight}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">{t("hero.subtext")}</label>
              <input className="dash-input" maxLength={150} value={subtext} onChange={(e) => setSubtext(e.target.value)} placeholder={t("hero.subtextPlaceholder")} />
              <CharLimitHint max={150} current={subtext.length} />
              <TextStyleGroup
                colorLabel="Text Color" colorValue={subtextColor} onColorChange={setSubtextColor}
                fontValue={subtextFont} onFontChange={setSubtextFont}
                weightValue={subtextWeight} onWeightChange={setSubtextWeight}
              />
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("hero.primaryCta")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">{t("hero.ctaLabel")}</label>
              <input className="dash-input" maxLength={25} value={ctaLabel1} onChange={(e) => setCtaLabel1(e.target.value)} placeholder="View Projects" />
              <CharLimitHint max={25} current={ctaLabel1.length} />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">{t("hero.ctaTarget")}</label>
              <select className="dash-input" value={ctaTarget1} onChange={(e) => setCtaTarget1(e.target.value)}>
                {ctaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <TextStyleGroup
            colorLabel={t("hero.buttonBgColor")} colorValue={ctaBg1} onColorChange={setCtaBg1}
            fontValue={ctaFont1} onFontChange={setCtaFont1}
            weightValue={ctaWeight1} onWeightChange={setCtaWeight1}
          />
          <div className="mt-3">
            <label className="text-xs text-[var(--muted)] mb-1 block">
              {t("hero.buttonTextColor")}
              {ctaTextColor1 && <button onClick={() => setCtaTextColor1("")} className="ml-2 text-[var(--accent)] text-xs hover:underline">{t("common.clear")}</button>}
            </label>
            <div className="flex items-center gap-2">
              <input type="color" value={ctaTextColor1 || "#ffffff"} onChange={(e) => setCtaTextColor1(e.target.value)} className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer" />
              <input className="dash-input" value={ctaTextColor1} onChange={(e) => setCtaTextColor1(e.target.value)} placeholder={t("common.default")} />
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("hero.secondaryCta")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">{t("hero.ctaLabel")}</label>
              <input className="dash-input" maxLength={25} value={ctaLabel2} onChange={(e) => setCtaLabel2(e.target.value)} placeholder="Contact Me" />
              <CharLimitHint max={25} current={ctaLabel2.length} />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">{t("hero.ctaTarget")}</label>
              <select className="dash-input" value={ctaTarget2} onChange={(e) => setCtaTarget2(e.target.value)}>
                {ctaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <TextStyleGroup
            colorLabel={t("hero.buttonBgColor")} colorValue={ctaBg2} onColorChange={setCtaBg2}
            fontValue={ctaFont2} onFontChange={setCtaFont2}
            weightValue={ctaWeight2} onWeightChange={setCtaWeight2}
          />
          <div className="mt-3">
            <label className="text-xs text-[var(--muted)] mb-1 block">
              {t("hero.buttonTextColor")}
              {ctaTextColor2 && <button onClick={() => setCtaTextColor2("")} className="ml-2 text-[var(--accent)] text-xs hover:underline">{t("common.clear")}</button>}
            </label>
            <div className="flex items-center gap-2">
              <input type="color" value={ctaTextColor2 || "#ffffff"} onChange={(e) => setCtaTextColor2(e.target.value)} className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer" />
              <input className="dash-input" value={ctaTextColor2} onChange={(e) => setCtaTextColor2(e.target.value)} placeholder={t("common.default")} />
            </div>
          </div>
        </div>
      </div>

      <Toast message={t("hero.saved")} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
