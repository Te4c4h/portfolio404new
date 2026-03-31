"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";
import { TextStyleGroup, CharLimitHint, ColorPickerField } from "@/components/StyleFields";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function LoadingScreenPage() {
  const { t } = useTranslation();
  const [loadingHeading, setLoadingHeading] = useState("");
  const [loadingSubtitle, setLoadingSubtitle] = useState("");
  const [enabled, setEnabled] = useState(true);

  // L-1: Heading & subtitle styling
  const [loadingHeadingColor, setLoadingHeadingColor] = useState("");
  const [loadingHeadingFont, setLoadingHeadingFont] = useState("");
  const [loadingHeadingWeight, setLoadingHeadingWeight] = useState("");
  const [loadingSubColor, setLoadingSubColor] = useState("");
  const [loadingSubFont, setLoadingSubFont] = useState("");
  const [loadingSubWeight, setLoadingSubWeight] = useState("");

  // L-2: Background color
  const [loadingBgColor, setLoadingBgColor] = useState("");

  // L-3: Duration
  const [loadingDuration, setLoadingDuration] = useState(2.5);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/site");
    const data = await res.json();
    if (data) {
      setLoadingHeading(data.loadingHeading || "");
      setLoadingSubtitle(data.loadingSubtitle || "");
      setEnabled(data.loadingScreenEnabled ?? true);
      setLoadingHeadingColor(data.loadingHeadingColor || "");
      setLoadingHeadingFont(data.loadingHeadingFont || "");
      setLoadingHeadingWeight(data.loadingHeadingWeight || "");
      setLoadingSubColor(data.loadingSubColor || "");
      setLoadingSubFont(data.loadingSubFont || "");
      setLoadingSubWeight(data.loadingSubWeight || "");
      setLoadingBgColor(data.loadingBgColor || "");
      setLoadingDuration(data.loadingDuration ?? 2.5);
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
        loadingHeading, loadingSubtitle, loadingScreenEnabled: enabled,
        loadingHeadingColor, loadingHeadingFont, loadingHeadingWeight,
        loadingSubColor, loadingSubFont, loadingSubWeight,
        loadingBgColor, loadingDuration,
      }),
    });
    setSaving(false);
    setToast(true);
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">{t("common.loading")}</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("sidebar.loadingScreen")}</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? t("common.saving") : t("common.saveChanges")}
        </button>
      </div>

      <div className="space-y-6">
        {/* Toggle */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{t("loadingScreen.showToggle")}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{t("loadingScreen.showToggleHint")}</p>
            </div>
            <button
              onClick={() => setEnabled((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 transition-opacity ${!enabled ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("loadingScreen.content")}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">{t("loadingScreen.heading")}</label>
              <input className="dash-input" maxLength={40} value={loadingHeading} onChange={(e) => setLoadingHeading(e.target.value)} placeholder={t("loadingScreen.headingPlaceholder")} />
              <CharLimitHint max={40} current={loadingHeading.length} />
              <TextStyleGroup
                colorLabel={t("loadingScreen.headingColor")} colorValue={loadingHeadingColor} onColorChange={setLoadingHeadingColor}
                fontValue={loadingHeadingFont} onFontChange={setLoadingHeadingFont}
                weightValue={loadingHeadingWeight} onWeightChange={setLoadingHeadingWeight}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">{t("loadingScreen.subtitle")}</label>
              <input className="dash-input" maxLength={60} value={loadingSubtitle} onChange={(e) => setLoadingSubtitle(e.target.value)} placeholder={t("loadingScreen.subtitlePlaceholder")} />
              <CharLimitHint max={60} current={loadingSubtitle.length} />
              <TextStyleGroup
                colorLabel={t("loadingScreen.subtitleColor")} colorValue={loadingSubColor} onColorChange={setLoadingSubColor}
                fontValue={loadingSubFont} onFontChange={setLoadingSubFont}
                weightValue={loadingSubWeight} onWeightChange={setLoadingSubWeight}
              />
            </div>
          </div>
        </div>

        {/* L-2: Background Color */}
        <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 transition-opacity ${!enabled ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("loadingScreen.background")}</h2>
          <ColorPickerField label={t("loadingScreen.bgColor")} value={loadingBgColor} onChange={setLoadingBgColor} />
          <p className="text-[var(--muted)] text-[10px] mt-1">{t("loadingScreen.bgHint")}</p>
        </div>

        {/* L-3: Duration */}
        <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 transition-opacity ${!enabled ? "opacity-50 pointer-events-none" : ""}`}>
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("loadingScreen.duration")}</h2>
          <div>
            <label className="text-xs text-[var(--muted)] mb-1 block">{t("loadingScreen.durationLabel")}</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={6}
                step={0.5}
                value={loadingDuration}
                onChange={(e) => setLoadingDuration(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
              <span className="text-sm font-medium text-[var(--foreground)] w-10 text-right">{loadingDuration}s</span>
            </div>
            <p className="text-[var(--muted)] text-[10px] mt-1">{t("loadingScreen.durationHint")}</p>
          </div>
        </div>
      </div>

      <Toast message={t("loadingScreen.saved")} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
