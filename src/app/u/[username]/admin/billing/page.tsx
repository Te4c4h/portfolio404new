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

  if (loading) return <div className="text-[#888] text-sm">Loading...</div>;

  const status = sub?.subscriptionStatus || "free";
  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#fafafa] mb-6">Billing</h1>

      {/* Success banner after checkout */}
      {successBanner && (
        <div className="mb-6 bg-[#70E844]/10 border border-[#70E844]/20 rounded-xl p-4 flex items-center gap-3">
          <FiCheck size={18} className="text-[#70E844] flex-shrink-0" />
          <p className="text-sm text-[#ccc]">
            Payment successful! Your subscription is being activated. It may take a moment for your status to update.
          </p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#fafafa] uppercase tracking-wider">Current Plan</h2>
          <PlanBadge status={status} isFreeAccess={sub?.isFreeAccess || false} />
        </div>

        {/* Free Access */}
        {sub?.isFreeAccess && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[#70E844]/5 border border-[#70E844]/10">
            <FiZap size={18} className="text-[#70E844] mt-0.5" />
            <div>
              <p className="text-sm text-[#fafafa] font-medium">Free Access Granted</p>
              <p className="text-xs text-[#888] mt-0.5">
                An admin has granted you full access. No subscription required.
              </p>
            </div>
          </div>
        )}

        {/* Active */}
        {status === "active" && !sub?.isFreeAccess && (
          <div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#70E844]/5 border border-[#70E844]/10 mb-4">
              <FiCheck size={18} className="text-[#70E844] mt-0.5" />
              <div>
                <p className="text-sm text-[#fafafa] font-medium">Portfolio 404 Pro — $1/month</p>
                {periodEnd && (
                  <p className="text-xs text-[#888] mt-0.5">Next billing date: {periodEnd}</p>
                )}
              </div>
            </div>
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="text-xs text-[#888] hover:text-[#FE454E] transition-colors"
              >
                Cancel subscription
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FE454E]/5 border border-[#FE454E]/10">
                <p className="text-xs text-[#ccc] flex-1">
                  Are you sure? You'll keep access until {periodEnd || "the end of your billing period"}.
                </p>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-3 py-1.5 rounded text-xs bg-[#FE454E] text-white hover:bg-[#e03d45] disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="px-3 py-1.5 rounded text-xs bg-[#2a2a2a] text-[#fafafa] hover:bg-[#333]"
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
              <p className="text-sm text-[#fafafa] font-medium">Subscription Cancelled</p>
              <p className="text-xs text-[#888] mt-0.5">
                {periodEnd
                  ? `You still have access until ${periodEnd}. After that, your portfolio will no longer be public.`
                  : "Your access will end at the end of your billing period."}
              </p>
            </div>
          </div>
        )}

        {/* Past Due */}
        {status === "past_due" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[#FE454E]/5 border border-[#FE454E]/10">
            <FiAlertTriangle size={18} className="text-[#FE454E] mt-0.5" />
            <div>
              <p className="text-sm text-[#fafafa] font-medium">Payment Failed</p>
              <p className="text-xs text-[#888] mt-0.5">
                Your last payment failed. Please update your payment method to keep your portfolio published.
              </p>
            </div>
          </div>
        )}

        {/* Free — upgrade prompt */}
        {status === "free" && !sub?.isFreeAccess && (
          <div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#2a2a2a]/50 border border-[#2a2a2a] mb-4">
              <FiZap size={18} className="text-[#888] mt-0.5" />
              <div>
                <p className="text-sm text-[#fafafa] font-medium">Free Plan</p>
                <p className="text-xs text-[#888] mt-0.5">
                  You can build and edit your portfolio, but it won't be publicly visible until you subscribe.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubscribe}
                disabled={checkingOut}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-[#70E844] text-[#131313] hover:bg-[#5ed636] transition-colors disabled:opacity-50"
              >
                {checkingOut ? "Redirecting..." : "Upgrade to Pro — $1/mo"}
              </button>
              <Link
                href="/pricing"
                className="text-xs text-[#888] hover:text-[#fafafa] transition-colors"
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
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#70E844]/15 text-[#70E844]">
        Free Access
      </span>
    );
  }

  switch (status) {
    case "active":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#70E844]/15 text-[#70E844]">
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
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FE454E]/15 text-[#FE454E]">
          Past Due
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#888]/15 text-[#888]">
          Free
        </span>
      );
  }
}
