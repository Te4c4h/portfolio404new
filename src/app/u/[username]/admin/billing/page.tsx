"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { FiZap, FiCheck } from "react-icons/fi";
import Link from "next/link";
import dynamic from "next/dynamic";

const PayPalButton = dynamic(() => import("@/components/PayPalButton"), { ssr: false });

export default function BillingPage() {
  const { data: session, status } = useSession();
  const isPaid = session?.user?.isPaid === true;
  const isFreeAccess = session?.user?.isFreeAccess === true;
  const isAdmin = session?.user?.isAdmin === true;

  if (status === "loading") {
    return <div className="text-[var(--muted)] text-sm">Loading...</div>;
  }

  return (
    <div className="w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Plan & Billing</h1>

      {/* Current Plan Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">Current Plan</h2>
          {isAdmin ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">Admin</span>
          ) : isFreeAccess ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">Free Access</span>
          ) : isPaid ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">Lifetime Pro</span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--muted)]/15 text-[var(--muted)]">Free</span>
          )}
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
            <FiZap size={18} className="text-[var(--accent)] mt-0.5" />
            <div>
              <p className="text-sm text-[var(--foreground)] font-medium">Admin Account</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Full access — no payment required.</p>
            </div>
          </div>
        )}

        {/* Free Access granted by admin */}
        {!isAdmin && isFreeAccess && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
            <FiZap size={18} className="text-[var(--accent)] mt-0.5" />
            <div>
              <p className="text-sm text-[var(--foreground)] font-medium">Free Access Granted</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                An admin has granted you full access. No payment required.
              </p>
            </div>
          </div>
        )}

        {/* Paid — lifetime access */}
        {!isAdmin && !isFreeAccess && isPaid && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
            <FiCheck size={18} className="text-[var(--accent)] mt-0.5" />
            <div>
              <p className="text-sm text-[var(--foreground)] font-medium">Portfolio 404 Pro — Lifetime Access</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                You&apos;ve made a one-time payment. Your access never expires.
              </p>
            </div>
          </div>
        )}

        {/* Unpaid — show PayPal button */}
        {!isAdmin && !isFreeAccess && !isPaid && (
          <div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--border)]/50 border border-[var(--border)] mb-5">
              <FiZap size={18} className="text-[var(--muted)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--foreground)] font-medium">Free Plan</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  You can build and edit your portfolio, but it won&apos;t be publicly visible until you activate your plan.
                </p>
              </div>
            </div>

            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--background)]">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-[var(--foreground)]">$5</span>
                <span className="text-[var(--muted)] text-sm">one-time</span>
              </div>
              <p className="text-xs text-[var(--muted)] mb-4">Pay once. Lifetime access. No recurring charges.</p>
              <Suspense fallback={<div className="h-12 rounded-xl bg-[var(--border)] animate-pulse" />}>
                <PayPalButton userId={session?.user?.id ?? ""} />
              </Suspense>
              <p className="text-[var(--muted)] text-[10px] text-center mt-3">
                Secure payment via PayPal. One-time charge of $5.00 USD.
              </p>
            </div>

            <p className="mt-3 text-center">
              <Link href="/#pricing" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                View all features →
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
