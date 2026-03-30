"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Toast from "@/components/Toast";

interface PricingConfig {
  id: string;
  price: string;
  period: string;
  tagline: string;
  features: string;
  ctaLabel: string;
  priceColor: string;
  priceFont: string;
  priceWeight: string;
  periodColor: string;
  periodFont: string;
  periodWeight: string;
  taglineColor: string;
  taglineFont: string;
  taglineWeight: string;
  featuresColor: string;
  featuresFont: string;
  featuresWeight: string;
  featuresMarkColor: string;
  ctaColor: string;
  ctaFont: string;
  ctaWeight: string;
  ctaBgColor: string;
  ctaAction: string;
}

const WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

const CTA_ACTIONS = [
  { value: "signup", label: "Open Sign Up page" },
  { value: "payment", label: "Redirect to Payment" },
];

const inputCls = "w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";
const selectCls = "w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";
const colorCls = "w-10 h-10 rounded-lg border border-[var(--border)] cursor-pointer bg-transparent p-0.5";

function StyleRow({
  label,
  color, onColor,
  font, onFont,
  weight, onWeight,
}: {
  label: string;
  color: string; onColor: (v: string) => void;
  font: string; onFont: (v: string) => void;
  weight: string; onWeight: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">{label}</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-[var(--muted)] mb-1 block">Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => onColor(e.target.value)} className={colorCls} />
            <input type="text" value={color} onChange={(e) => onColor(e.target.value)} className={inputCls} placeholder="#ffffff" />
          </div>
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] mb-1 block">Font Family</label>
          <input type="text" value={font} onChange={(e) => onFont(e.target.value)} className={inputCls} placeholder="Default" />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] mb-1 block">Weight</label>
          <select value={weight} onChange={(e) => onWeight(e.target.value)} className={selectCls}>
            {WEIGHT_OPTIONS.map((w) => (
              <option key={w.value} value={w.value}>{w.label} ({w.value})</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function AdminPricingPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Pricing saved!");

  const load = useCallback(async () => {
    const r = await fetch("/api/pricing");
    if (r.ok) setConfig(await r.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key: keyof PricingConfig, value: string) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = config;
    const r = await fetch("/api/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (r.ok) {
      setToastMsg("Pricing saved!");
      setToast(true);
    }
  };

  if (!isAdmin) {
    return <div className="text-[var(--muted)] text-sm">Access denied.</div>;
  }

  if (!config) {
    return <div className="text-[var(--muted)] text-sm">Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Pricing Section</h1>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Content Fields */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-5 mb-6">
        <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--muted)] mb-1.5 block">Price</label>
            <input type="text" value={config.price} onChange={(e) => update("price", e.target.value)} placeholder="$5" className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] mb-1.5 block">Period</label>
            <input type="text" value={config.period} onChange={(e) => update("period", e.target.value)} placeholder="one-time" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] mb-1.5 block">Tagline</label>
          <input type="text" value={config.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Pay once. Lifetime access." className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] mb-1.5 block">Features <span className="text-[var(--muted)]/60">(one per line)</span></label>
          <textarea rows={6} value={config.features} onChange={(e) => update("features", e.target.value)} placeholder={"Live public portfolio\nResume builder & downloads\nLifetime access"} className={`${inputCls} resize-none font-mono`} />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] mb-1.5 block">CTA Button Label</label>
          <input type="text" value={config.ctaLabel} onChange={(e) => update("ctaLabel", e.target.value)} placeholder="Get Started" className={inputCls} />
        </div>
      </div>

      {/* Styling Fields */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-6 mb-6">
        <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Text Styling</h2>

        <StyleRow
          label="Price"
          color={config.priceColor} onColor={(v) => update("priceColor", v)}
          font={config.priceFont} onFont={(v) => update("priceFont", v)}
          weight={config.priceWeight} onWeight={(v) => update("priceWeight", v)}
        />

        <div className="border-t border-[var(--border)]" />

        <StyleRow
          label="Period"
          color={config.periodColor} onColor={(v) => update("periodColor", v)}
          font={config.periodFont} onFont={(v) => update("periodFont", v)}
          weight={config.periodWeight} onWeight={(v) => update("periodWeight", v)}
        />

        <div className="border-t border-[var(--border)]" />

        <StyleRow
          label="Tagline"
          color={config.taglineColor} onColor={(v) => update("taglineColor", v)}
          font={config.taglineFont} onFont={(v) => update("taglineFont", v)}
          weight={config.taglineWeight} onWeight={(v) => update("taglineWeight", v)}
        />

        <div className="border-t border-[var(--border)]" />

        <StyleRow
          label="Features"
          color={config.featuresColor} onColor={(v) => update("featuresColor", v)}
          font={config.featuresFont} onFont={(v) => update("featuresFont", v)}
          weight={config.featuresWeight} onWeight={(v) => update("featuresWeight", v)}
        />

        <div>
          <label className="text-xs text-[var(--muted)] mb-1 block">Feature Check Mark Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={config.featuresMarkColor} onChange={(e) => update("featuresMarkColor", e.target.value)} className={colorCls} />
            <input type="text" value={config.featuresMarkColor} onChange={(e) => update("featuresMarkColor", e.target.value)} className={`${inputCls} max-w-[160px]`} placeholder="#70E844" />
          </div>
        </div>
      </div>

      {/* CTA Button Styling */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-5">
        <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">CTA Button</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--muted)] mb-1 block">Button Action</label>
            <select value={config.ctaAction} onChange={(e) => update("ctaAction", e.target.value)} className={selectCls}>
              {CTA_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] mb-1 block">Background Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={config.ctaBgColor} onChange={(e) => update("ctaBgColor", e.target.value)} className={colorCls} />
              <input type="text" value={config.ctaBgColor} onChange={(e) => update("ctaBgColor", e.target.value)} className={inputCls} placeholder="#70E844" />
            </div>
          </div>
        </div>

        <StyleRow
          label="Button Text"
          color={config.ctaColor} onColor={(v) => update("ctaColor", v)}
          font={config.ctaFont} onFont={(v) => update("ctaFont", v)}
          weight={config.ctaWeight} onWeight={(v) => update("ctaWeight", v)}
        />
      </div>

      <Toast message={toastMsg} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
