"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiLayers,
  FiGrid,
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

interface AdminSidebarProps {
  username: string;
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
}

const portfolioChildren = [
  { href: "/portfolio/navbar", label: "Navigation", icon: FiNavigation },
  { href: "/portfolio/hero", label: "Hero", icon: FiStar },
  { href: "/portfolio/about", label: "About", icon: FiUser },
  { href: "/portfolio/sections", label: "Categories", icon: FiFolder },
  { href: "/portfolio/sections-content", label: "Projects", icon: FiBriefcase },
  { href: "/portfolio/contact", label: "Contact Info", icon: FiMail },
  { href: "/portfolio/footer", label: "Footer", icon: FiType },
  { href: "/portfolio/loading-screen", label: "Loading Screen", icon: FiMonitor },
  { href: "/portfolio/settings", label: "Appearance", icon: FiSettings },
];

export default function AdminSidebar({ username, isAdmin, firstName, lastName }: AdminSidebarProps) {
  const pathname = usePathname();
  const basePath = `/u/${username}/admin`;
  const [open, setOpen] = useState(false);

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
        <h2 className="text-[#70E844] font-bold text-lg tracking-tight truncate">
          {displayName}
        </h2>
        {!isAdmin && (
          <a
            href={`/u/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#70E844]/30 text-[#70E844] hover:bg-[#70E844]/10 transition-colors"
          >
            <FiExternalLink size={13} />
            View Portfolio
          </a>
        )}
        {isAdmin && (
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#70E844]/30 text-[#70E844] hover:bg-[#70E844]/10 transition-colors"
          >
            <FiExternalLink size={13} />
            View Home Page
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
              ? "bg-[#70E844]/10 text-[#70E844]"
              : "text-[#888] hover:text-[#fafafa] hover:bg-[#ffffff08]"
          }`}
        >
          <FiBarChart2 size={18} />
          Analytics
        </Link>

        {/* Account Settings — non-admin only */}
        {!isAdmin && (
          <Link
            href={basePath + "/account-settings"}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive("/account-settings")
                ? "bg-[#70E844]/10 text-[#70E844]"
                : "text-[#888] hover:text-[#fafafa] hover:bg-[#ffffff08]"
            }`}
          >
            <FiSliders size={18} />
            Account Settings
          </Link>
        )}

        {/* Portfolio Dropdown */}
        <div>
          <button
            onClick={() => setPortfolioOpen((v) => !v)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full ${
              isPortfolioActive
                ? "bg-[#70E844]/10 text-[#70E844]"
                : "text-[#888] hover:text-[#fafafa] hover:bg-[#ffffff08]"
            }`}
          >
            <FiLayout size={18} />
            <span className="flex-1 text-left">Portfolio</span>
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
                <div className="ml-3 pl-3 border-l border-[#2a2a2a] mt-1 space-y-0.5">
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
                            ? "bg-[#70E844]/10 text-[#70E844]"
                            : "text-[#888] hover:text-[#fafafa] hover:bg-[#ffffff08]"
                        }`}
                      >
                        <Icon size={16} />
                        {child.label}
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
                ? "bg-[#70E844]/10 text-[#70E844]"
                : "text-[#888] hover:text-[#fafafa] hover:bg-[#ffffff08]"
            }`}
          >
            <FiFileText size={18} />
            Resume
          </Link>
        )}

        {/* Billing — non-admin only, only when LemonSqueezy is enabled */}
        {!isAdmin && process.env.NEXT_PUBLIC_LEMONSQUEEZY_ENABLED === "true" && (
          <Link
            href={basePath + "/billing"}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive("/billing")
                ? "bg-[#70E844]/10 text-[#70E844]"
                : "text-[#888] hover:text-[#fafafa] hover:bg-[#ffffff08]"
            }`}
          >
            <FiCreditCard size={18} />
            Plan & Billing
          </Link>
        )}

        {/* Admin: Manage Users */}
        {isAdmin && (
          <>
            <div className="my-3 border-t border-[#2a2a2a]" />
            <Link
              href={`${basePath}/users`}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith(`${basePath}/users`)
                  ? "bg-[#70E844]/10 text-[#70E844]"
                  : "text-[#888] hover:text-[#fafafa] hover:bg-[#ffffff08]"
              }`}
            >
              <FiLayers size={18} />
              Manage Users
            </Link>
          </>
        )}
      </nav>

      {/* Logout — pinned to bottom */}
      <div className="px-3 pb-6">
        <button
          onClick={() => signOut({ callbackUrl: isAdmin ? "/" : `/u/${username}` })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#888] hover:text-[#FE454E] hover:bg-[#FE454E]/10 transition-colors w-full"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#181818] border border-[#2a2a2a] text-[#fafafa]"
      >
        <FiMenu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-60 bg-[#181818] border-r border-[#2a2a2a]">
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
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 h-[100dvh] w-60 bg-[#181818] border-r border-[#2a2a2a] z-50 lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-[#888] hover:text-[#fafafa]"
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
