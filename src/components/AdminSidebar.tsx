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
} from "react-icons/fi";

interface AdminSidebarProps {
  username: string;
  isAdmin?: boolean;
}

const userLinks = [
  { href: "", label: "Dashboard", icon: FiHome },
  { href: "/sections", label: "Sections", icon: FiLayers },
  { href: "/content", label: "Sections Content", icon: FiGrid },
  { href: "/site", label: "Site Content", icon: FiFileText },
  { href: "/contact", label: "Contact Links", icon: FiLink },
  { href: "/theme", label: "Theme", icon: FiDroplet },
];

export default function AdminSidebar({ username, isAdmin }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const basePath = `/u/${username}/admin`;

  const links = userLinks;

  const isActive = (href: string) => {
    const full = basePath + href;
    if (href === "") return pathname === basePath;
    return pathname.startsWith(full);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6">
        <h2 className="text-[#70E844] font-bold text-lg tracking-tight">
          Admin Panel
        </h2>
        <a
          href={`/u/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#70E844] transition-colors mt-1"
        >
          <FiExternalLink size={12} />
          View Portfolio
        </a>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={basePath + link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[#70E844]/10 text-[#70E844]"
                  : "text-[#888] hover:text-[#fafafa] hover:bg-[#ffffff08]"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === "/admin"
                ? "bg-[#70E844]/10 text-[#70E844]"
                : "text-[#888] hover:text-[#fafafa] hover:bg-[#ffffff08]"
            }`}
          >
            <FiLayers size={18} />
            Manage Users
          </Link>
        )}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
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
