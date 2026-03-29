"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiCheck, FiZap, FiArrowRight } from "react-icons/fi";
import dynamic from "next/dynamic";

const PayPalButton = dynamic(() => import("@/components/PayPalButton"), { ssr: false });

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
  const { data: session, status } = useSession();
  const router = useRouter();

  const isPaid = session?.user?.isPaid === true;

  useEffect(() => {
    if (status === "authenticated" && isPaid && session?.user?.username) {
      router.replace(`/u/${session.user.username}/admin`);
    }
  }, [status, isPaid, session?.user?.username, router]);

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

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          One payment,{" "}
          <span className="text-[var(--accent)]">lifetime access</span>
        </h1>
        <p className="text-[var(--muted)] mt-4 text-lg max-w-xl mx-auto">
          Build and publish your professional portfolio with a single one-time payment. No subscriptions, no hidden fees.
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
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Lifetime Access</span>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-bold text-[var(--foreground)]">$5</span>
              <span className="text-[var(--muted)] text-sm">one-time</span>
            </div>
            <p className="text-[var(--muted)] text-xs mb-6">Pay once. Use forever. No recurring charges.</p>

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
            {status === "loading" ? (
              <div className="h-12 rounded-xl bg-[var(--border)] animate-pulse" />
            ) : session && !isPaid ? (
              <div>
                <PayPalButton userEmail={session.user.email} />
                <p className="text-[var(--muted)] text-[10px] text-center mt-3">
                  Secure payment via PayPal. One-time charge of $5.00 USD.
                </p>
              </div>
            ) : !session ? (
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                Create Account to Buy
                <FiArrowRight size={16} />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
