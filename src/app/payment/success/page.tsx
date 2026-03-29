"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiCheckCircle, FiArrowRight, FiLoader } from "react-icons/fi";

function PaymentSuccessContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);

  const txId = searchParams.get("tx") || "";
  const username = session?.user?.username;

  useEffect(() => {
    if (!username) return;

    // Poll the server up to 10x (5s intervals) to confirm isPaid is set
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      try {
        const res = await fetch("/api/user/payment-status");
        const data = await res.json();
        if (data.isPaid) {
          // Refresh session so middleware and client have up-to-date isPaid
          await update();
          setChecking(false);
          return;
        }
      } catch {
        // ignore transient errors
      }
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, 3000);
      } else {
        // IPN may be delayed — show success anyway, user can go to dashboard
        setChecking(false);
      }
    };

    poll();
  }, [username, update]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10">

          {checking ? (
            <>
              <FiLoader size={40} className="text-[var(--accent)] mx-auto mb-5 animate-spin" />
              <h1 className="text-2xl font-bold mb-3">Confirming your payment…</h1>
              <p className="text-[var(--muted)] text-sm">
                We&apos;re verifying your payment with PayPal. This usually takes a few seconds.
              </p>
            </>
          ) : (
            <>
              <FiCheckCircle size={48} className="text-[var(--accent)] mx-auto mb-5" />
              <h1 className="text-2xl font-bold mb-3">Payment Successful!</h1>
              <p className="text-[var(--muted)] text-sm mb-2">
                Thank you for your purchase. You now have lifetime access to Portfolio 404 Pro.
              </p>
              {txId && (
                <p className="text-[var(--muted)] text-[10px] mb-6">Transaction ID: {txId}</p>
              )}
              {!txId && (
                <p className="text-[var(--muted)] text-[10px] mb-6">
                  A confirmation email is on its way to your inbox.
                </p>
              )}

              {session ? (
                <Link
                  href={`/u/${username}/admin`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Go to Dashboard
                  <FiArrowRight size={16} />
                </Link>
              ) : (
                <button
                  onClick={() => signIn(undefined, { callbackUrl: "/login" })}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Log In to Access Dashboard
                  <FiArrowRight size={16} />
                </button>
              )}
            </>
          )}

        </div>
        <p className="text-[var(--muted)] text-[10px] mt-4">
          Didn&apos;t receive access? Contact us and include your PayPal transaction ID.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <FiLoader size={32} className="text-[var(--accent)] animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
