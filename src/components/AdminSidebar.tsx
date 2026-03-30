"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiLayers,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiX,
  FiExternalLink,
  FiChevronDown,
  FiNavigation,
  FiStar,
  FiUser,
  FiMail,
  FiType,
  FiSettings,
  FiLayout,
  FiCreditCard,
  FiFolder,
  FiBriefcase,
  FiSliders,
  FiMonitor,
} from "react-icons/fi";
import ThemeToggle from "@/components/ThemeToggle";
// import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface AdminSidebarProps {
  username: string;
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
}

const portfolioChildren = [
  { href: "/portfolio/navbar", labelKey: "sidebar.navigation", icon: FiNavigation },
  { href: "/portfolio/hero", labelKey: "sidebar.hero", icon: FiStar },
  { href: "/portfolio/about", labelKey: "sidebar.about", icon: FiUser },
  { href: "/portfolio/sections", labelKey: "sidebar.categories", icon: FiFolder },
  { href: "/portfolio/sections-content", labelKey: "sidebar.projects", icon: FiBriefcase },
  { href: "/portfolio/pricing", labelKey: "sidebar.pricing", icon: FiCreditCard },
  { href: "/portfolio/contact", labelKey: "sidebar.contactInfo", icon: FiMail },
  { href: "/portfolio/footer", labelKey: "sidebar.footer", icon: FiType },
  { href: "/portfolio/loading-screen", labelKey: "sidebar.loadingScreen", icon: FiMonitor },
  { href: "/portfolio/settings", labelKey: "sidebar.appearance", icon: FiSettings },
];

export default function AdminSidebar({ username, isAdmin, firstName, lastName }: AdminSidebarProps) {
  const pathname = usePathname();
  const basePath = `/u/${username}/admin`;
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const isPortfolioActive = pathname.startsWith(`${basePath}/portfolio`);
  const [portfolioOpen, setPortfolioOpen] = useState(isPortfolioActive);

  const isActive = (href: string) => {
    const full = basePath + href;
    if (href === "") return pathname === basePath;
    // Exact match for /portfolio/sections to avoid also matching /portfolio/sections-content
    if (href === "/portfolio/sections") return pathname === full;
    return pathname.startsWith(full);
  };

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || username;

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Header — User name + View Portfolio */}
      <div className="px-5 py-6">
        <h2 className="text-[var(--accent)] font-bold text-lg tracking-tight truncate">
          {displayName}
        </h2>
        {!isAdmin && (
          <a
            href={`/u/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 mt-2 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors duration-200 border bg-transparent text-[#70E844] border-[#70E844]/50 hover:border-[#70E844] hover:bg-[#70E844]/5"
          >
            <FiExternalLink size={16} />
            <span>{t("sidebar.viewPortfolio")}</span>
          </a>
        )}
        {isAdmin && (
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 mt-2 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors duration-200 border bg-transparent text-[#70E844] border-[#70E844]/50 hover:border-[#70E844] hover:bg-[#70E844]/5"
          >
            <FiExternalLink size={16} />
            <span>{t("sidebar.viewHomePage")}</span>
          </a>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {/* Analytics */}
        <Link
          href={basePath}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive("")
              ? "bg-[var(--sidebar-active)] text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20"
          }`}
        >
          <FiBarChart2 size={18} />
          {t("sidebar.analytics")}
        </Link>

        {/* Portfolio Dropdown */}
        <div>
          <button
            onClick={() => setPortfolioOpen((v) => !v)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full ${
              isPortfolioActive
                ? "bg-[var(--sidebar-active)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20"
            }`}
          >
            <FiLayout size={18} />
            <span className="flex-1 text-left">{t("sidebar.portfolio")}</span>
            <FiChevronDown
              size={14}
              className={`transition-transform duration-200 ${portfolioOpen ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {portfolioOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-3 pl-3 border-l border-[var(--border)] mt-1 space-y-0.5">
                  {portfolioChildren.map((child) => {
                    const Icon = child.icon;
                    const active = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={basePath + child.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          active
                            ? "bg-[var(--sidebar-active)] text-[var(--accent)]"
                            : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20"
                        }`}
                      >
                        <Icon size={16} />
                        {t(child.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resume — non-admin only */}
        {!isAdmin && (
          <Link
            href={basePath + "/resume"}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive("/resume")
                ? "bg-[var(--sidebar-active)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20"
            }`}
          >
            <FiFileText size={18} />
            {t("sidebar.resume")}
          </Link>
        )}

        {/* Account Settings */}
        <Link
          href={basePath + "/account-settings"}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive("/account-settings")
              ? "bg-[var(--sidebar-active)] text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20"
          }`}
        >
          <FiSliders size={18} />
          {t("sidebar.accountSettings")}
        </Link>

        {/* Billing — non-admin only */}
        {!isAdmin && (
          <Link
            href={basePath + "/billing"}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive("/billing")
                ? "bg-[var(--sidebar-active)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20"
            }`}
          >
            <FiCreditCard size={18} />
            {t("sidebar.planBilling")}
          </Link>
        )}

        {/* Admin: Manage Users + Pricing */}
        {isAdmin && (
          <>
            <div className="my-3 border-t border-[var(--border)]" />
            <Link
              href={`${basePath}/users`}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith(`${basePath}/users`)
                  ? "bg-[var(--sidebar-active)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/20"
              }`}
            >
              <FiLayers size={18} />
              {t("sidebar.manageUsers")}
            </Link>
          </>
        )}
      </nav>

      {/* Bottom — pinned */}
      <div className="px-3 pb-6 space-y-2">
        {/* <LanguageSwitcher /> */}
        <ThemeToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors duration-200 border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
        >
          <FiLogOut size={16} />
          <span>{t("sidebar.logout")}</span>
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
              className="fixed inset-0 bg-[var(--overlay)] z-[9998] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 h-[100dvh] w-60 bg-[var(--surface)] border-r border-[var(--border)] z-[9999] lg:hidden"
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
