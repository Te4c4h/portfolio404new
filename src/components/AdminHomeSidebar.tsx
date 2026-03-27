"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiLayers,
  FiGrid,
  FiFileText,
  FiLink,
  FiDroplet,
  FiLogOut,
  FiMenu,
  FiX,
  FiExternalLink,
  FiArrowLeft,
  FiSliders,
} from "react-icons/fi";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface AdminHomeSidebarProps {
  username: string;
}

const homeLinks = [
  { href: "/admin/home", labelKey: "sidebar.dashboard", icon: FiHome },
  { href: "/admin/home/sections", labelKey: "sidebar.sections", icon: FiLayers },
  { href: "/admin/home/content", labelKey: "sidebar.sectionsContent", icon: FiGrid },
  { href: "/admin/home/site", labelKey: "sidebar.siteContent", icon: FiFileText },
  { href: "/admin/home/contact", labelKey: "sidebar.contactLinks", icon: FiLink },
  { href: "/admin/home/theme", labelKey: "sidebar.theme", icon: FiDroplet },
];

export default function AdminHomeSidebar({ username }: AdminHomeSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const isActive = (href: string) => {
    if (href === "/admin/home") return pathname === "/admin/home";
    return pathname.startsWith(href);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6">
        <h2 className="text-[var(--accent)] font-bold text-lg tracking-tight">
          {t("sidebar.homePage")}
        </h2>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mt-1"
        >
          <FiExternalLink size={12} />
          {t("sidebar.viewHomePage")}
        </a>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {homeLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
              }`}
            >
              <Icon size={18} />
              {t(link.labelKey)}
            </Link>
          );
        })}

        <div className="my-3 border-t border-[var(--border)]" />

        <Link
          href={`/u/${username}/admin`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
        >
          <FiArrowLeft size={18} />
          {t("sidebar.myDashboard")}
        </Link>
        <Link
          href={`/u/${username}/admin/users`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
        >
          <FiLayers size={18} />
          {t("sidebar.manageUsers")}
        </Link>
      </nav>

      <div className="px-3 pb-6 space-y-1">
        <div className="flex items-center justify-center gap-2 py-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <Link
          href={`/u/${username}/admin/account-settings`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
        >
          <FiSliders size={18} />
          {t("sidebar.accountSettings")}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors w-full"
        >
          <FiLogOut size={18} />
          {t("sidebar.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
      >
        <FiMenu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-60 bg-[var(--surface)] border-r border-[var(--border)]">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-[var(--overlay)] z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 h-[100dvh] w-60 bg-[var(--surface)] border-r border-[var(--border)] z-50 lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <FiX size={20} />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
