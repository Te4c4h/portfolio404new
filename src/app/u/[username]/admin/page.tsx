"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiZap, FiCopy, FiCheck, FiTrendingUp, FiTrendingDown, FiEye, FiUsers, FiMousePointer } from "react-icons/fi";

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  viewsThisMonth: number;
  viewsLastMonth: number;
  monthChange: number;
  dailyChart: { date: string; views: number }[];
  contactStats: { type: string; clicks: number }[];
  sectionsCount: number;
  contentCount: number;
  mostViewedSection: string | null;
  lastUpdated: string | null;
  portfolioUrl: string;
}

interface SubStatus {
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  isFreeAccess: boolean;
  hasAccess: boolean;
}

function MiniLineChart({ data, accent }: { data: { date: string; views: number }[]; accent: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.views), 1);
  const w = 600;
  const h = 160;
  const px = 40;
  const py = 20;
  const chartW = w - px * 2;
  const chartH = h - py * 2;

  const points = data.map((d, i) => ({
    x: px + (i / (data.length - 1)) * chartW,
    y: py + chartH - (d.views / max) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${py + chartH} L ${points[0].x} ${py + chartH} Z`;

  const yTicks = [0, Math.round(max / 2), max];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {yTicks.map((tick) => {
        const y = py + chartH - (tick / max) * chartH;
        return (
          <g key={tick}>
            <line x1={px} y1={y} x2={w - px} y2={y} stroke="var(--border)" strokeWidth={1} />
            <text x={px - 6} y={y + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize={10}>{tick}</text>
          </g>
        );
      })}
      <path d={areaPath} fill={accent} opacity={0.08} />
      <path d={linePath} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={accent} opacity={p.views > 0 ? 1 : 0.3} />
      ))}
      {/* X-axis labels — show every 7th */}
      {points.filter((_, i) => i % 7 === 0).map((p) => (
        <text key={p.date} x={p.x} y={h - 2} textAnchor="middle" fill="var(--muted-foreground)" fontSize={9}>
          {new Date(p.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </text>
      ))}
    </svg>
  );
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<SubStatus | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [copied, setCopied] = useState(false);

  const lsEnabled = process.env.NEXT_PUBLIC_LEMONSQUEEZY_ENABLED === "true";

  useEffect(() => {
    fetch("/api/analytics/stats")
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAdmin && lsEnabled) {
      fetch("/api/subscription")
        .then((r) => r.json())
        .then(setSub)
        .catch(() => {});
    }
  }, [isAdmin, lsEnabled]);

  const handleSubscribe = async () => {
    setCheckingOut(true);
    try {
      const r = await fetch("/api/subscription/checkout", { method: "POST" });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setCheckingOut(false);
    }
  };

  const copyUrl = () => {
    if (!analytics) return;
    navigator.clipboard.writeText(analytics.portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Analytics</h1>

      {/* Upgrade Banner */}
      {lsEnabled && !isAdmin && sub && !sub.hasAccess && (
        <div className="mb-6 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-[var(--accent)] font-semibold text-sm flex items-center gap-2">
                <FiZap size={16} />
                Upgrade to Portfolio 404 Pro
              </h2>
              <p className="text-[var(--muted)] text-xs mt-1">
                Subscribe for <strong className="text-[var(--foreground)]">$1/month</strong> to publish and share your portfolio with the world.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubscribe}
                disabled={checkingOut}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {checkingOut ? "Redirecting..." : "Subscribe — $1/mo"}
              </button>
              <Link href="/pricing" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-[var(--muted)] text-sm">Loading analytics...</div>
      ) : !analytics ? (
        <div className="text-[var(--muted)] text-sm">Could not load analytics.</div>
      ) : (
        <>
          {/* Visitor Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiEye size={14} className="text-[var(--muted)]" />
                <p className="text-[var(--muted)] text-xs uppercase tracking-wider">Total Views</p>
              </div>
              <p className="text-3xl font-bold text-[var(--accent)]">{analytics.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiUsers size={14} className="text-[var(--muted)]" />
                <p className="text-[var(--muted)] text-xs uppercase tracking-wider">Unique Days</p>
              </div>
              <p className="text-3xl font-bold text-[var(--accent)]">{analytics.uniqueVisitors}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiEye size={14} className="text-[var(--muted)]" />
                <p className="text-[var(--muted)] text-xs uppercase tracking-wider">This Month</p>
              </div>
              <p className="text-3xl font-bold text-[var(--accent)]">{analytics.viewsThisMonth.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                {analytics.monthChange >= 0 ? (
                  <FiTrendingUp size={12} className="text-[var(--accent)]" />
                ) : (
                  <FiTrendingDown size={12} className="text-[var(--danger)]" />
                )}
                <span className={`text-xs font-medium ${analytics.monthChange >= 0 ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
                  {analytics.monthChange >= 0 ? "+" : ""}{analytics.monthChange}% vs last month
                </span>
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FiEye size={14} className="text-[var(--muted)]" />
                <p className="text-[var(--muted)] text-xs uppercase tracking-wider">Last Month</p>
              </div>
              <p className="text-3xl font-bold text-[var(--muted)]">{analytics.viewsLastMonth.toLocaleString()}</p>
            </div>
          </div>

          {/* Daily Chart */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4 uppercase tracking-wider">Daily Visitors — Last 30 Days</h2>
            <MiniLineChart data={analytics.dailyChart} accent="var(--accent)" />
          </div>

          {/* Contact Analytics */}
          {analytics.contactStats.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6">
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4 uppercase tracking-wider flex items-center gap-2">
                <FiMousePointer size={14} />
                Contact Link Clicks
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {analytics.contactStats.map((c) => (
                  <div key={c.type} className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-center">
                    <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">{c.type}</p>
                    <p className="text-2xl font-bold text-[var(--accent)]">{c.clicks}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-[var(--muted)] text-xs uppercase tracking-wider mb-1">Total Sections</p>
              <p className="text-3xl font-bold text-[var(--accent)]">{analytics.sectionsCount}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-[var(--muted)] text-xs uppercase tracking-wider mb-1">Total Content Items</p>
              <p className="text-3xl font-bold text-[var(--accent)]">{analytics.contentCount}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-[var(--muted)] text-xs uppercase tracking-wider mb-1">Top Section</p>
              <p className="text-lg font-semibold text-[var(--accent)] truncate">{analytics.mostViewedSection || "—"}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted)] text-xs uppercase tracking-wider">Last Updated</span>
                  <span className="text-sm text-[var(--foreground)]">
                    {analytics.lastUpdated
                      ? new Date(analytics.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted)] text-xs uppercase tracking-wider">Portfolio URL</span>
                  <a href={analytics.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] hover:underline truncate max-w-xs break-all">
                    {analytics.portfolioUrl}
                  </a>
                  <button onClick={copyUrl} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex-shrink-0" title="Copy URL">
                    {copied ? <FiCheck size={14} className="text-[var(--accent)]" /> : <FiCopy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
