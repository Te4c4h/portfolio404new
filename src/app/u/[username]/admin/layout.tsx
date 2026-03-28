"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.user.username !== username && !session.user.isAdmin) {
      router.replace(`/u/${session.user.username}/admin`);
    }
  }, [session, status, username, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--muted)] text-sm">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AdminSidebar username={username} isAdmin={session.user.isAdmin} firstName={session.user.firstName || ""} lastName={session.user.lastName || ""} />
      <main className="lg:ml-72 min-h-screen p-6 pt-16 lg:pt-6 w-full">
        {children}
      </main>
    </div>
  );
}
