"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";
import { TextStyleGroup, CharLimitHint } from "@/components/StyleFields";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function FooterPage() {
  const { t } = useTranslation();
  const [footerText, setFooterText] = useState("");
  const [footerTextColor, setFooterTextColor] = useState("");
  const [footerTextFont, setFooterTextFont] = useState("");
  const [footerTextWeight, setFooterTextWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/site");
    const d = await r.json();
    if (d) {
      setFooterText(d.footerText || "");
      setFooterTextColor(d.footerTextColor || "");
      setFooterTextFont(d.footerTextFont || "");
      setFooterTextWeight(d.footerTextWeight || "");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ footerText, footerTextColor, footerTextFont, footerTextWeight }),
    });
    setSaving(false);
    setToast(true);
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">{t("common.loading")}</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("footer.title")}</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? t("common.saving") : t("common.saveChanges")}
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">{t("footer.footerText")}</h2>
          <input className="dash-input" maxLength={80} value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder={t("footer.footerPlaceholder")} />
          <CharLimitHint max={80} current={footerText.length} />
          <p className="text-[var(--muted)] text-[10px] mt-0.5">{t("footer.footerDisplayHint")}</p>
          <TextStyleGroup
            colorLabel="Text Color" colorValue={footerTextColor} onColorChange={setFooterTextColor}
            fontValue={footerTextFont} onFontChange={setFooterTextFont}
            weightValue={footerTextWeight} onWeightChange={setFooterTextWeight}
          />
        </div>
      </div>

      <Toast message={t("footer.saved")} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
