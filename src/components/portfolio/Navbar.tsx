"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import type { NavLinkData } from "./PortfolioClient";

interface NavbarProps {
  logoUrl: string;
  logoText: string;
  navLinks: NavLinkData[];
  accent: string;
}

export default function Navbar({ logoUrl, logoText, navLinks, accent }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.slice(1);
      if (!id) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl" : ""
      }`}
      style={scrolled ? { backgroundColor: "rgba(19, 19, 19, 0.9)" } : undefined}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={logoText || "Logo"}
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
              onError={(e) => {
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  e.currentTarget.style.display = "none";
                  const span = document.createElement("span");
                  span.className = "text-lg font-bold";
                  span.style.fontFamily = "var(--font-heading)";
                  span.style.color = "var(--text)";
                  span.textContent = logoText || "Logo";
                  parent.appendChild(span);
                }
              }}
            />
          ) : (
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
              {logoText}
            </span>
          )}
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-sm transition-colors"
              style={{ color: "var(--text)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
          style={{ color: "var(--text)" }}
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-b border-white/5"
            style={{ background: "var(--bg)" }}
          >
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    const href = link.href;
                    setTimeout(() => {
                      if (href.startsWith("#")) {
                        const id = href.slice(1);
                        if (!id) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
                        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                      }
                    }, 300);
                  }}
                  className="block text-sm py-1"
                  style={{ color: "var(--text)" }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
