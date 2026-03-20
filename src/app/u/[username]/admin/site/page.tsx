"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SiteContentRedirect() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  useEffect(() => {
    router.replace(`/u/${username}/admin/portfolio/navbar`);
  }, [router, username]);

  return <div className="text-[var(--muted)] text-sm">Redirecting...</div>;
}
