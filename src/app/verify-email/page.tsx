"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    fetch(`/api/verify-email?token=${token}`)
      .then(async (r) => {
        if (r.ok) {
          setStatus("success");
          setMessage("Your email has been verified! Redirecting to login...");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          const data = await r.json();
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong.");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#181818] border border-[#2a2a2a] rounded-2xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-8 h-8 border-2 border-[#70E844] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#888] text-sm">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-[#70E844]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#70E844]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-[#fafafa] font-medium">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-[#FE454E]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#FE454E]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-[#FE454E] font-medium mb-4">{message}</p>
            <a href="/login" className="text-[#70E844] text-sm hover:underline">Go to login</a>
          </>
        )}
      </div>
    </div>
  );
}
