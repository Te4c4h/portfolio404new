"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiCheck, FiZap, FiArrowRight } from "react-icons/fi";

const features = [
  "Custom portfolio with your own URL",
  "Drag-and-drop section builder",
  "Multiple content types (projects, code, video, 3D)",
  "Resume builder with PDF & DOCX export",
  "Custom themes, fonts, and colors",
  "SEO optimized with OG tags",
  "Mobile responsive design",
  "Grid overlay & custom cursor",
  "Contact section with social links",
  "Loading screen customization",
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [checkingOut, setCheckingOut] = useState(false);
  const lsEnabled = process.env.NEXT_PUBLIC_LEMONSQUEEZY_ENABLED === "true";

  const handleSubscribe = async () => {
    if (!session) return;
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="text-[var(--accent)] font-bold text-lg">
          Portfolio 404
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href={`/u/${session.user.username}/admin`}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {!lsEnabled ? (
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-8 text-center">
          <FiZap size={32} className="text-[var(--accent)] mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] mb-3">
            Pricing — Coming Soon
          </h1>
          <p className="text-[var(--muted)] text-lg max-w-md mx-auto mb-8">
            We&apos;re finalizing our subscription plans. All features are currently free while we set things up.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      ) : (
      <>
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Simple pricing,{" "}
          <span className="text-[var(--accent)]">powerful portfolio</span>
        </h1>
        <p className="text-[var(--muted)] mt-4 text-lg max-w-xl mx-auto">
          Build and publish your professional portfolio for less than a cup of coffee per month.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-md mx-auto px-6 pb-24">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 relative overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <FiZap size={18} className="text-[var(--accent)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Pro Plan</span>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-bold text-[var(--foreground)]">$1</span>
              <span className="text-[var(--muted)] text-sm">/month</span>
            </div>
            <p className="text-[var(--muted-foreground)] text-xs mb-6">Cancel anytime. No hidden fees.</p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <FiCheck size={16} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[var(--foreground)]/80">{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {session ? (
              <button
                onClick={handleSubscribe}
                disabled={checkingOut}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {checkingOut ? "Redirecting..." : (
                  <>
                    Subscribe Now
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
            ) : (
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Create Account & Subscribe
                <FiArrowRight size={16} />
              </Link>
            )}

            <p className="text-[var(--muted-foreground)] text-[10px] text-center mt-3">
              Secure payment via LemonSqueezy. Cancel from your dashboard at any time.
            </p>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
