"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ContactLinksRedirect() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  useEffect(() => {
    router.replace(`/u/${username}/admin/portfolio/contact`);
  }, [router, username]);

  return <div className="text-[var(--muted)] text-sm">Redirecting...</div>;
}
