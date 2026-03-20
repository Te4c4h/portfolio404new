"use client";

import { useEffect, useState } from "react";
import { FiExternalLink } from "react-icons/fi";

interface Stats {
  sectionsCount: number;
  contentCount: number;
  lastUpdated: string | null;
  contentPerSection: { name: string; count: number }[];
}

export default function AdminHomeDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/home/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Home Page Dashboard</h1>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <FiExternalLink size={14} />
          View Home Page
        </a>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-[var(--muted)] text-xs uppercase tracking-wider mb-1">Total Sections</p>
          <p className="text-3xl font-bold text-[var(--accent)]">{stats?.sectionsCount ?? "—"}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-[var(--muted)] text-xs uppercase tracking-wider mb-1">Total Content Items</p>
          <p className="text-3xl font-bold text-[var(--accent)]">{stats?.contentCount ?? "—"}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <p className="text-[var(--muted)] text-xs uppercase tracking-wider mb-1">Last Updated</p>
          <p className="text-lg font-semibold text-[var(--accent)]">
            {stats?.lastUpdated
              ? new Date(stats.lastUpdated).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })
              : "—"}
          </p>
        </div>
      </div>

      {/* Content Per Section */}
      {stats && stats.contentPerSection.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3 uppercase tracking-wider">Content Per Section</h2>
          <div className="space-y-2">
            {stats.contentPerSection.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-[var(--foreground)]/80">{s.name}</span>
                <span className="text-[var(--accent)] font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
