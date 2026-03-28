"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiZap, FiCheck, FiAlertTriangle, FiClock } from "react-icons/fi";
import Link from "next/link";

interface SubStatus {
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  isFreeAccess: boolean;
  hasAccess: boolean;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [sub, setSub] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      setSuccessBanner(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((data) => {
        setSub(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const r = await fetch("/api/subscription/cancel", { method: "POST" });
      if (r.ok) {
        setSub((prev) => prev ? { ...prev, subscriptionStatus: "cancelled", hasAccess: true } : prev);
      }
    } catch { /* ignore */ }
    setCancelling(false);
    setConfirmCancel(false);
  };

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

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;

  const status = sub?.subscriptionStatus || "free";
  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Plan & Billing</h1>

      {/* Success banner after checkout */}
      {successBanner && (
        <div className="mb-6 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-4 flex items-center gap-3">
          <FiCheck size={18} className="text-[var(--accent)] flex-shrink-0" />
          <p className="text-sm text-[var(--foreground)]/80">
            Payment successful! Your subscription is being activated. It may take a moment for your status to update.
          </p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">Current Plan</h2>
          <PlanBadge status={status} isFreeAccess={sub?.isFreeAccess || false} />
        </div>

        {/* Free Access */}
        {sub?.isFreeAccess && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
            <FiZap size={18} className="text-[var(--accent)] mt-0.5" />
            <div>
              <p className="text-sm text-[var(--foreground)] font-medium">Free Access Granted</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                An admin has granted you full access. No subscription required.
              </p>
            </div>
          </div>
        )}

        {/* Active */}
        {status === "active" && !sub?.isFreeAccess && (
          <div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10 mb-4">
              <FiCheck size={18} className="text-[var(--accent)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--foreground)] font-medium">Portfolio 404 Pro — $1/month</p>
                {periodEnd && (
                  <p className="text-xs text-[var(--muted)] mt-0.5">Next billing date: {periodEnd}</p>
                )}
              </div>
            </div>
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="text-xs text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
              >
                Cancel subscription
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--danger)]/5 border border-[var(--danger)]/10">
                <p className="text-xs text-[var(--foreground)]/80 flex-1">
                  Are you sure? You&apos;ll keep access until {periodEnd || "the end of your billing period"}.
                </p>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-3 py-1.5 rounded text-xs bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)] disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="px-3 py-1.5 rounded text-xs bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]"
                >
                  Keep Plan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cancelled */}
        {status === "cancelled" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[#FFA500]/5 border border-[#FFA500]/10">
            <FiClock size={18} className="text-[#FFA500] mt-0.5" />
            <div>
              <p className="text-sm text-[var(--foreground)] font-medium">Subscription Cancelled</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {periodEnd
                  ? `You still have access until ${periodEnd}. After that, your portfolio will no longer be public.`
                  : "Your access will end at the end of your billing period."}
              </p>
            </div>
          </div>
        )}

        {/* Past Due */}
        {status === "past_due" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--danger)]/5 border border-[var(--danger)]/10">
            <FiAlertTriangle size={18} className="text-[var(--danger)] mt-0.5" />
            <div>
              <p className="text-sm text-[var(--foreground)] font-medium">Payment Failed</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Your last payment failed. Please update your payment method to keep your portfolio published.
              </p>
            </div>
          </div>
        )}

        {/* Free — upgrade prompt */}
        {status === "free" && !sub?.isFreeAccess && (
          <div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--border)]/50 border border-[var(--border)] mb-4">
              <FiZap size={18} className="text-[var(--muted)] mt-0.5" />
              <div>
                <p className="text-sm text-[var(--foreground)] font-medium">Free Plan</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  You can build and edit your portfolio, but it won&apos;t be publicly visible until you subscribe.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubscribe}
                disabled={checkingOut}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {checkingOut ? "Redirecting..." : "Upgrade to Pro — $1/mo"}
              </button>
              <Link
                href="/pricing"
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                View features
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanBadge({ status, isFreeAccess }: { status: string; isFreeAccess: boolean }) {
  if (isFreeAccess) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
        Free Access
      </span>
    );
  }

  switch (status) {
    case "active":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
          Pro
        </span>
      );
    case "cancelled":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFA500]/15 text-[#FFA500]">
          Cancelled
        </span>
      );
    case "past_due":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--danger)]/15 text-[var(--danger)]">
          Past Due
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--muted)]/15 text-[var(--muted)]">
          Free
        </span>
      );
  }
}
