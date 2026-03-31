"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { FiZap, FiCheck } from "react-icons/fi";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const PayPalButton = dynamic(() => import("@/components/PayPalButton"), { ssr: false });

export default function BillingPage() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const isPaid = session?.user?.isPaid === true;
  const isFreeAccess = session?.user?.isFreeAccess === true;
  const isAdmin = session?.user?.isAdmin === true;

  if (status === "loading") {
    return <div className="text-[var(--muted)] text-sm">{t("common.loading")}</div>;
  }

  return (
    <div className="w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">{t("billing.title")}</h1>

      {/* Current Plan Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">{t("billing.currentPlan")}</h2>
          {isAdmin ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">{t("billing.admin")}</span>
          ) : isFreeAccess ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">{t("billing.freeAccess")}</span>
          ) : isPaid ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">{t("billing.lifetimePro")}</span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--muted)]/15 text-[var(--muted)]">{t("billing.free")}</span>
          )}
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
            <FiZap size={18} className="text-[var(--accent)] mt-0.5" />
            <div>
              <p className="text-sm text-[var(--foreground)] font-medium">{t("billing.adminAccount")}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{t("billing.adminDesc")}</p>
            </div>
          </div>
        )}

        {/* Free Access granted by admin */}
        {!isAdmin && isFreeAccess && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
            <FiZap size={18} className="text-[var(--accent)] mt-0.5" />
            <div>
              <p className="text-sm text-[var(--foreground)] font-medium">{t("billing.freeAccessGranted")}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {t("billing.freeAccessDesc")}
              </p>
            </div>
          </div>
        )}

        {/* Paid — lifetime access */}
        {!isAdmin && !isFreeAccess && isPaid && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
            <FiCheck size={18} className="text-[var(--accent)] mt-0.5" />
            <div>
              <p className="text-sm text-[var(--foreground)] font-medium">{t("billing.proTitle")}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {t("billing.proDesc")}
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
                <p className="text-sm text-[var(--foreground)] font-medium">{t("billing.freePlan")}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {t("billing.freePlanDesc")}
                </p>
              </div>
            </div>

            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--background)]">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-[var(--foreground)]">$5</span>
                <span className="text-[var(--muted)] text-sm">{t("billing.oneTime")}</span>
              </div>
              <p className="text-xs text-[var(--muted)] mb-4">{t("billing.payOnce")}</p>
              <Suspense fallback={<div className="h-12 rounded-xl bg-[var(--border)] animate-pulse" />}>
                <PayPalButton userId={session?.user?.id ?? ""} />
              </Suspense>
              <p className="text-[var(--muted)] text-[10px] text-center mt-3">
                {t("billing.securePayment")}
              </p>
            </div>

            <p className="mt-3 text-center">
              <a href="/#pricing" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                {t("billing.viewFeatures")}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
