"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.user.isAdmin) {
      router.replace(`/u/${session.user.username}/admin`);
    } else {
      router.replace(`/u/${session.user.username}/admin`);
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-[var(--muted)] text-sm">Redirecting...</div>
    </div>
  );
}
