"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiZap } from "react-icons/fi";

interface Stats {
  sectionsCount: number;
  contentCount: number;
  lastUpdated: string | null;
  contentPerSection: { name: string; count: number }[];
}

interface SubStatus {
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  isFreeAccess: boolean;
  hasAccess: boolean;
}

export default function UserAdminPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;
  const [stats, setStats] = useState<Stats | null>(null);
  const [sub, setSub] = useState<SubStatus | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      fetch("/api/subscription")
        .then((r) => r.json())
        .then(setSub)
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleSubscribe = async () => {
    setCheckingOut(true);
    try {
      const r = await fetch("/api/subscription/checkout", { method: "POST" });
      const data = await r.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setCheckingOut(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#fafafa] mb-6">Dashboard</h1>

      {/* Upgrade Banner */}
      {!isAdmin && sub && !sub.hasAccess && (
        <div className="mb-6 bg-gradient-to-r from-[#70E844]/10 to-[#70E844]/5 border border-[#70E844]/20 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-[#70E844] font-semibold text-sm flex items-center gap-2">
                <FiZap size={16} />
                Upgrade to Portfolio 404 Pro
              </h2>
              <p className="text-[#888] text-xs mt-1">
                Your portfolio is not visible to the public. Subscribe for <strong className="text-[#fafafa]">$1/month</strong> to publish and share it with the world.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubscribe}
                disabled={checkingOut}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-[#70E844] text-[#131313] hover:bg-[#5ed636] transition-colors disabled:opacity-50"
              >
                {checkingOut ? "Redirecting..." : "Subscribe — $1/mo"}
              </button>
              <Link
                href="/pricing"
                className="text-xs text-[#888] hover:text-[#fafafa] transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Total Sections</p>
          <p className="text-3xl font-bold text-[#70E844]">{stats?.sectionsCount ?? "—"}</p>
        </div>
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Total Content Items</p>
          <p className="text-3xl font-bold text-[#70E844]">{stats?.contentCount ?? "—"}</p>
        </div>
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5">
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Last Updated</p>
          <p className="text-lg font-semibold text-[#70E844]">
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
        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-[#fafafa] mb-3 uppercase tracking-wider">Content Per Section</h2>
          <div className="space-y-2">
            {stats.contentPerSection.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-[#ccc]">{s.name}</span>
                <span className="text-[#70E844] font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
