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

  const save = async () => {
    if (!config) return;
    setSaving(true);
    const r = await fetch("/api/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: config.price,
        period: config.period,
        tagline: config.tagline,
        features: config.features,
        ctaLabel: config.ctaLabel,
      }),
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
    <div className="w-full max-w-2xl">
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

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--muted)] mb-1.5 block">Price</label>
            <input
              type="text"
              value={config.price}
              onChange={(e) => setConfig({ ...config, price: e.target.value })}
              placeholder="$5"
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)] mb-1.5 block">Period</label>
            <input
              type="text"
              value={config.period}
              onChange={(e) => setConfig({ ...config, period: e.target.value })}
              placeholder="one-time"
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-[var(--muted)] mb-1.5 block">Tagline</label>
          <input
            type="text"
            value={config.tagline}
            onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
            placeholder="Pay once. Lifetime access. No recurring charges."
            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        <div>
          <label className="text-xs text-[var(--muted)] mb-1.5 block">
            Features <span className="text-[var(--muted)]/60">(one per line)</span>
          </label>
          <textarea
            rows={7}
            value={config.features}
            onChange={(e) => setConfig({ ...config, features: e.target.value })}
            placeholder={"Live public portfolio\nResume builder & downloads\nLifetime access"}
            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none font-mono"
          />
        </div>

        <div>
          <label className="text-xs text-[var(--muted)] mb-1.5 block">CTA Button Label</label>
          <input
            type="text"
            value={config.ctaLabel}
            onChange={(e) => setConfig({ ...config, ctaLabel: e.target.value })}
            placeholder="Get Started"
            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Preview</h2>
        <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 max-w-sm mx-auto text-center">
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="text-4xl font-bold text-white">{config.price}</span>
            <span className="text-gray-400 text-base">{config.period}</span>
          </div>
          <p className="text-gray-400 text-xs mb-5">{config.tagline}</p>
          <ul className="space-y-2 mb-5 text-left">
            {config.features.split("\n").filter(Boolean).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-200">
                <span className="text-[#70E844]">✓</span> {f}
              </li>
            ))}
          </ul>
          <div className="block w-full py-2 bg-[#70E844] text-[#131313] font-bold rounded-lg text-sm">
            {config.ctaLabel}
          </div>
        </div>
      </div>

      <Toast message={toastMsg} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
