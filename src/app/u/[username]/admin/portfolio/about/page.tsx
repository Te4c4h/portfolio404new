"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";
import { TextStyleGroup, CharLimitHint } from "@/components/StyleFields";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function AboutPage() {
  const { t } = useTranslation();
  const [aboutText, setAboutText] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  // About section heading
  const [aboutHeading, setAboutHeading] = useState("");
  const [aboutHeadingColor, setAboutHeadingColor] = useState("");
  const [aboutHeadingFont, setAboutHeadingFont] = useState("");
  const [aboutHeadingWeight, setAboutHeadingWeight] = useState("");

  // A-1: About text styling
  const [aboutTextColor, setAboutTextColor] = useState("");
  const [aboutTextFont, setAboutTextFont] = useState("");
  const [aboutTextWeight, setAboutTextWeight] = useState("");

  // A-2: Skills tag styling
  const [skillTagBg, setSkillTagBg] = useState("");
  const [skillTagColor, setSkillTagColor] = useState("");
  const [skillTagFont, setSkillTagFont] = useState("");
  const [skillTagWeight, setSkillTagWeight] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/site");
    const d = await r.json();
    if (d) {
      setAboutText(d.aboutText || "");
      setSkills(d.skills || "");
      setAboutHeading(d.aboutHeading || "");
      setAboutHeadingColor(d.aboutHeadingColor || "");
      setAboutHeadingFont(d.aboutHeadingFont || "");
      setAboutHeadingWeight(d.aboutHeadingWeight || "");
      setAboutTextColor(d.aboutTextColor || "");
      setAboutTextFont(d.aboutTextFont || "");
      setAboutTextWeight(d.aboutTextWeight || "");
      setSkillTagBg(d.skillTagBg || "");
      setSkillTagColor(d.skillTagColor || "");
      setSkillTagFont(d.skillTagFont || "");
      setSkillTagWeight(d.skillTagWeight || "");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aboutText, skills,
        aboutHeading, aboutHeadingColor, aboutHeadingFont, aboutHeadingWeight,
        aboutTextColor, aboutTextFont, aboutTextWeight,
        skillTagBg, skillTagColor, skillTagFont, skillTagWeight,
      }),
    });
    setSaving(false);
    setToast(true);
  };

  const skillCount = skills ? skills.split(",").filter((s) => s.trim()).length : 0;

  if (loading) return <div className="text-[var(--muted)] text-sm">{t("common.loading")}</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("about.title")}</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? t("common.saving") : t("common.saveChanges")}
        </button>
      </div>

      <div className="space-y-8">
        {/* Section Heading */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("about.sectionHeading")}</h2>
          <input className="dash-input" maxLength={40} value={aboutHeading} onChange={(e) => setAboutHeading(e.target.value)} placeholder={t("about.headingPlaceholder")} />
          <CharLimitHint max={40} current={aboutHeading.length} />
          <TextStyleGroup
            colorLabel={t("about.headingColor")} colorValue={aboutHeadingColor} onColorChange={setAboutHeadingColor}
            fontValue={aboutHeadingFont} onFontChange={setAboutHeadingFont}
            weightValue={aboutHeadingWeight} onWeightChange={setAboutHeadingWeight}
          />
        </div>

        {/* About Text */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("about.aboutText")}</h2>
          <textarea className="dash-input min-h-[120px]" maxLength={800} value={aboutText} onChange={(e) => setAboutText(e.target.value)} placeholder={t("about.aboutTextPlaceholder")} />
          <CharLimitHint max={800} current={aboutText.length} />
          <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">{t("about.paragraphHint")}</p>
          <TextStyleGroup
            colorLabel={t("about.textColor")} colorValue={aboutTextColor} onColorChange={setAboutTextColor}
            fontValue={aboutTextFont} onFontChange={setAboutTextFont}
            weightValue={aboutTextWeight} onWeightChange={setAboutTextWeight}
          />
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("about.skills")}</h2>
          <input className="dash-input" value={skills} onChange={(e) => {
            const val = e.target.value;
            const count = val.split(",").filter((s) => s.trim()).length;
            if (count <= 12 || val.length < skills.length) setSkills(val);
          }} placeholder={t("about.skillsPlaceholder")} />
          <p className={`text-[10px] mt-0.5 ${skillCount >= 12 ? "text-[var(--danger)]" : "text-[var(--muted)]"}`}>
            {t("about.skillsCount").replace("{count}", String(skillCount))}{skillCount >= 12 ? t("about.skillsLimit") : ""}
          </p>
          {/* A-2: Tag appearance preview */}
          {skills && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[11px]"
                  style={{
                    backgroundColor: skillTagBg || "var(--accent-15, rgba(112,232,68,0.15))",
                    color: skillTagColor || "var(--accent)",
                    fontFamily: skillTagFont || undefined,
                    fontWeight: skillTagWeight || undefined,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <TextStyleGroup
            colorLabel={t("about.tagTextColor")} colorValue={skillTagColor} onColorChange={setSkillTagColor}
            fontValue={skillTagFont} onFontChange={setSkillTagFont}
            weightValue={skillTagWeight} onWeightChange={setSkillTagWeight}
          />
          <div className="mt-3">
            <label className="text-xs text-[var(--muted)] mb-1 block">
              {t("about.tagBgColor")}
              {skillTagBg && <button onClick={() => setSkillTagBg("")} className="ml-2 text-[var(--accent)] text-xs hover:underline">{t("common.clear")}</button>}
            </label>
            <div className="flex items-center gap-2">
              <input type="color" value={skillTagBg || "#1a3a10"} onChange={(e) => setSkillTagBg(e.target.value)} className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer" />
              <input className="dash-input" value={skillTagBg} onChange={(e) => setSkillTagBg(e.target.value)} placeholder={t("common.default")} />
            </div>
          </div>
        </div>
      </div>

      <Toast message={t("about.saved")} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
