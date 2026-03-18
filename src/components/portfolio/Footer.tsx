"use client";

import Link from "next/link";

interface FooterProps {
  name: string;
  footerText?: string;
}

export default function Footer({ name, footerText }: FooterProps) {
  const copyright = footerText || `\u00A9 ${new Date().getFullYear()} ${name}`;

  return (
    <footer
      className="border-t py-8 px-6"
      style={{ borderColor: "var(--surface)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: "var(--text)", opacity: 0.4 }}>
        <span>{copyright}</span>
        <Link href="/login" className="hover:opacity-100 transition-opacity">
          Login
        </Link>
      </div>
    </footer>
  );
}
