"use client";

import { motion } from "framer-motion";
import {
  FiMail, FiPhone, FiGithub, FiLinkedin, FiInstagram, FiFacebook,
  FiYoutube, FiGlobe,
} from "react-icons/fi";
import { FaTelegram, FaWhatsapp, FaBehance, FaViber } from "react-icons/fa";
import { SiUpwork, SiFiverr } from "react-icons/si";
import type { ContactLinkData } from "./PortfolioClient";

interface ContactProps {
  title: string;
  subtitle: string;
  links: ContactLinkData[];
  accent: string;
  username?: string;
  titleColor?: string;
  titleFont?: string;
  titleWeight?: string;
  subtitleColor?: string;
  subtitleFont?: string;
  subtitleWeight?: string;
}

const iconMap: Record<string, React.ElementType> = {
  Email: FiMail, Phone: FiPhone, GitHub: FiGithub, LinkedIn: FiLinkedin,
  Telegram: FaTelegram, WhatsApp: FaWhatsapp, Instagram: FiInstagram,
  Facebook: FiFacebook, Behance: FaBehance, Upwork: SiUpwork,
  Fiverr: SiFiverr, Viber: FaViber, YouTube: FiYoutube, Other: FiGlobe,
};

export default function Contact({ title, subtitle, links, accent, username, titleColor, titleFont, titleWeight, subtitleColor, subtitleFont, subtitleWeight }: ContactProps) {
  const trackClick = (platform: string) => {
    if (!username) return;
    fetch("/api/analytics/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, contactType: platform }),
    }).catch(() => {});
  };
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{
            fontFamily: titleFont ? titleFont + ", sans-serif" : "var(--font-heading)",
            color: titleColor || "var(--text)",
            fontWeight: titleWeight || undefined,
          }}
        >
          {title}
        </motion.h2>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm mb-12"
            style={{
              color: subtitleColor || "var(--text)",
              opacity: subtitleColor ? 1 : 0.6,
              fontFamily: subtitleFont ? subtitleFont + ", sans-serif" : undefined,
              fontWeight: subtitleWeight || undefined,
            }}
          >
            {subtitle}
          </motion.p>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          {links.map((link, i) => {
            const Icon = iconMap[link.platform] || FiGlobe;
            return (
              <motion.a
                key={link.id}
                href={link.url}
                onClick={() => trackClick(link.platform)}
                {...(link.url.startsWith("mailto:") || link.url.startsWith("tel:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  width: 52,
                  height: 52,
                  backgroundColor: link.iconBgColor || "var(--surface)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: link.iconColor || "var(--text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = accent;
                  e.currentTarget.style.color = "#131313";
                  e.currentTarget.style.borderColor = accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = link.iconBgColor || "var(--surface)";
                  e.currentTarget.style.color = link.iconColor || "var(--text)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <Icon size={22} />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
