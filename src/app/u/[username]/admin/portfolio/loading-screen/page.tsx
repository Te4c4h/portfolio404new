"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";

export default function LoadingScreenPage() {
  const [loadingHeading, setLoadingHeading] = useState("");
  const [loadingSubtitle, setLoadingSubtitle] = useState("");
  const [enabled, setEnabled] = useState(true);

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
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loadingHeading, loadingSubtitle, loadingScreenEnabled: enabled }),
    });
    setSaving(false);
    setToast(true);
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Loading Screen</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Toggle */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Show loading screen when portfolio is visited</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">When off, your portfolio loads directly without the intro animation.</p>
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
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Loading Screen Content</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Loading Heading</label>
              <input className="dash-input" value={loadingHeading} onChange={(e) => setLoadingHeading(e.target.value)} placeholder="Your Name" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Loading Subtitle</label>
              <input className="dash-input" value={loadingSubtitle} onChange={(e) => setLoadingSubtitle(e.target.value)} placeholder="Portfolio" />
            </div>
          </div>
        </div>
      </div>

      <Toast message="Loading screen saved!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
