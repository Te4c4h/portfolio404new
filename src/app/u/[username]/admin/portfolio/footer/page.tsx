"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";

export default function FooterPage() {
  const [footerText, setFooterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/site");
    const d = await r.json();
    if (d) setFooterText(d.footerText || "");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ footerText }),
    });
    setSaving(false);
    setToast(true);
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Footer</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Footer</h2>
          <div>
            <label className="text-xs text-[var(--muted)] mb-1 block">Footer Copyright Text</label>
            <input className="dash-input" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="e.g. © 2026 Your Name" />
            <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">Leave empty to use default: © [year] [your name]</p>
          </div>
        </div>
      </div>

      <Toast message="Footer saved!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
