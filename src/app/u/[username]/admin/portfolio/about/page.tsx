"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";

export default function AboutPage() {
  const [aboutText, setAboutText] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/site");
    const d = await r.json();
    if (d) {
      setAboutText(d.aboutText || "");
      setSkills(d.skills || "");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aboutText, skills }),
    });
    setSaving(false);
    setToast(true);
  };

  if (loading) return <div className="text-[#888] text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#fafafa]">About</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#70E844] text-[#131313] hover:bg-[#5ed636] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">About Section</h2>
          <textarea className="dash-input min-h-[120px]" value={aboutText} onChange={(e) => setAboutText(e.target.value)} placeholder="Tell visitors about yourself..." />
          <p className="text-[#555] text-[10px] mt-1">Supports multiple paragraphs. Use line breaks to separate.</p>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">Skills</h2>
          <input className="dash-input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, Product Strategy" />
        </div>
      </div>

      <Toast message="About saved!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
