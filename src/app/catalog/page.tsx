"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiExternalLink, FiLayers, FiGrid } from "react-icons/fi";

interface CatalogUser {
  username: string;
  firstName: string;
  lastName: string;
  registeredAt: string;
  theme: { accentColor: string; webclipUrl: string } | null;
  siteContent: { headline: string; subtext: string } | null;
  _count: { sections: number; contentItems: number };
}

export default function CatalogPage() {
  const [users, setUsers] = useState<CatalogUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      (u.siteContent?.headline || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--accent)] font-bold text-lg hover:opacity-80 transition-opacity">
              Portfolio 404
            </Link>
            <span className="text-[var(--muted-foreground)] text-sm">/ Catalog</span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search portfolios..."
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)]/50 w-full sm:w-72 transition-colors"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
            Portfolio Catalog
          </h1>
          <p className="text-[var(--muted)] text-sm">
            Browse published portfolios from our community — {users.length} portfolio{users.length !== 1 ? "s" : ""} and counting.
          </p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--muted-foreground)] text-sm">{search ? "No portfolios match your search." : "No published portfolios yet."}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((user) => {
            const accent = user.theme?.accentColor || "#70E844";
            const fullName = `${user.firstName} ${user.lastName}`;
            const headline = user.siteContent?.headline || "";
            const subtext = user.siteContent?.subtext || "";

            return (
              <Link
                key={user.username}
                href={`/u/${user.username}`}
                className="group block bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--muted-foreground)] transition-all duration-300"
              >
                {/* Card top accent bar */}
                <div className="h-1" style={{ backgroundColor: accent }} />

                {/* OG image or placeholder */}
                {user.theme?.webclipUrl ? (
                  <div className="aspect-[2/1] overflow-hidden bg-[var(--background)]">
                    <img
                      src={user.theme.webclipUrl}
                      alt={fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/1] bg-[var(--background)] flex items-center justify-center">
                    <span className="text-4xl font-bold" style={{ color: `${accent}30`, fontFamily: "Syne, sans-serif" }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)] text-sm group-hover:text-white transition-colors">
                        {fullName}
                      </h3>
                      <p className="text-[var(--muted-foreground)] text-xs">@{user.username}</p>
                    </div>
                    <FiExternalLink size={14} className="text-[var(--muted-foreground)] group-hover:text-[var(--muted)] transition-colors mt-0.5 shrink-0" />
                  </div>

                  {(headline || subtext) && (
                    <p className="text-[var(--muted)] text-xs leading-relaxed line-clamp-2 mb-3">
                      {headline || subtext}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1">
                      <FiLayers size={10} /> {user._count.sections} section{user._count.sections !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiGrid size={10} /> {user._count.contentItems} item{user._count.contentItems !== 1 ? "s" : ""}
                    </span>
                    <span className="ml-auto" style={{ color: accent }}>
                      {new Date(user.registeredAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
