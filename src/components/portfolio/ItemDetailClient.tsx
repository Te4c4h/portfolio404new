"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiExternalLink, FiGithub, FiArrowLeft } from "react-icons/fi";
import CustomCursor from "./CustomCursor";
import Navbar from "./Navbar";
import Contact from "./Contact";
import Footer from "./Footer";
import FaviconSetter from "./FaviconSetter";
import type {
  ThemeData,
  SiteContentData,
  NavLinkData,
  ContactLinkData,
} from "./PortfolioClient";

interface ItemData {
  id: string;
  slug: string;
  contentType: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string;
  coverImage: string;
  coverImageDesc: string;
  image1: string;
  image1Desc: string;
  image2: string;
  image2Desc: string;
  image3: string;
  image3Desc: string;
  liveUrl: string;
  repoUrl: string;
  videoUrl: string;
  videoDesc: string;
  codeContent: string;
  codeLanguage: string;
  modelUrl: string;
  cardBg?: string;
  titleColor?: string;
  titleFont?: string;
  titleWeight?: string;
  descColor?: string;
  descFont?: string;
  descWeight?: string;
  tagBg?: string;
  tagColor?: string;
  tagFont?: string;
  tagWeight?: string;
  liveBtnBg?: string;
  liveBtnColor?: string;
  liveBtnFont?: string;
  liveBtnWeight?: string;
  repoBtnBg?: string;
  repoBtnColor?: string;
  repoBtnFont?: string;
  repoBtnWeight?: string;
  section: { name: string; slug: string };
}

interface ItemDetailClientProps {
  user: { firstName: string; lastName: string; username: string };
  theme: ThemeData | null;
  siteContent: SiteContentData | null;
  navLinks: NavLinkData[];
  contactLinks: ContactLinkData[];
  item: ItemData;
}

const defaults: ThemeData = {
  accentColor: "#70E844",
  backgroundColor: "#131313",
  surfaceColor: "#181818",
  textColor: "#fafafa",
  dangerColor: "#FE454E",
  cursorColor: "#70E844",
  bodyFont: "Inter",
  headingFont: "Syne",
  faviconUrl: "",
  webclipUrl: "",
  websiteTitle: "",
  gridColor: "rgba(255,255,255,0.03)",
};

function googleFontUrl(fonts: string[]): string {
  const unique = Array.from(new Set(fonts)).filter(Boolean);
  const families = unique.map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export default function ItemDetailClient({
  user, theme: rawTheme, siteContent, navLinks, contactLinks, item,
}: ItemDetailClientProps) {
  const theme = { ...defaults, ...Object.fromEntries(
    Object.entries(rawTheme || {}).filter(([, v]) => v !== null && v !== "")
  ) } as ThemeData;

  useEffect(() => {
    const trackedKey = `view_${user.username}`;
    if (sessionStorage.getItem(trackedKey)) return;
    sessionStorage.setItem(trackedKey, "true");
    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, referrer: document.referrer || null }),
    }).catch(() => {});
  }, [user.username]);

  const cssVars = {
    "--accent": theme.accentColor,
    "--bg": theme.backgroundColor,
    "--surface": theme.surfaceColor,
    "--text": theme.textColor,
    "--danger": theme.dangerColor,
    "--cursor": theme.cursorColor,
    "--font-body": theme.bodyFont + ", sans-serif",
    "--font-heading": theme.headingFont + ", sans-serif",
    "--grid-color": theme.gridColor,
  } as React.CSSProperties;

  const tags = item.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const images = [
    { src: item.coverImage, desc: item.coverImageDesc },
    { src: item.image1, desc: item.image1Desc },
    { src: item.image2, desc: item.image2Desc },
    { src: item.image3, desc: item.image3Desc },
  ].filter((img) => img.src);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={googleFontUrl([
        theme.bodyFont, theme.headingFont,
        ...[
          siteContent?.logoTextFont, siteContent?.contactTitleFont,
          siteContent?.contactSubFont, siteContent?.footerTextFont,
          item.titleFont, item.descFont, item.tagFont,
          item.liveBtnFont, item.repoBtnFont,
        ].filter(Boolean) as string[],
        ...navLinks.map((l) => l.labelFont).filter(Boolean) as string[],
      ])} rel="stylesheet" />
      <FaviconSetter url={theme.faviconUrl} />

      <div
        style={{ ...cssVars, backgroundColor: "var(--bg)", color: "var(--text)" }}
        className="min-h-screen relative"
      >
        {/* Grid overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-[2]"
          style={{
            backgroundImage: `linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <style>{`
          html, body {
            background-color: ${theme.backgroundColor} !important;
            color: ${theme.textColor} !important;
            font-family: ${theme.bodyFont}, sans-serif !important;
          }
          ::selection { background: ${theme.accentColor}; color: ${theme.backgroundColor}; }
        `}</style>

        <div className="relative z-[3]">
          <CustomCursor cursorColor={theme.cursorColor} />
          <Navbar
            logoUrl={siteContent?.useLogoImage ? (siteContent?.logoUrl || "") : ""}
            logoText={siteContent?.logoText || `${user.firstName} ${user.lastName}`}
            navLinks={navLinks}
            accent={theme.accentColor}
            navScrollBg={siteContent?.navScrollBg}
            logoTextColor={siteContent?.logoTextColor}
            logoTextFont={siteContent?.logoTextFont}
            logoTextWeight={siteContent?.logoTextWeight}
            hamburgerColor={siteContent?.hamburgerColor}
          />

          {/* Item Detail Section */}
          <section className="pt-32 pb-24 px-6">
            <div className="max-w-4xl mx-auto">
              {/* Back link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  href={`/u/${user.username}#${item.section.slug}`}
                  className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80"
                  style={{ color: theme.accentColor }}
                >
                  <FiArrowLeft size={16} />
                  {item.section.name}
                </Link>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                style={{
                  fontFamily: item.titleFont ? item.titleFont + ", sans-serif" : "var(--font-heading)",
                  color: item.titleColor || "var(--text)",
                  fontWeight: item.titleWeight || undefined,
                }}
              >
                {item.title}
              </motion.h1>

              {/* Tags */}
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex flex-wrap gap-2 mb-6"
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: item.tagBg || `${theme.accentColor}15`,
                        color: item.tagColor || theme.accentColor,
                        fontFamily: item.tagFont ? item.tagFont + ", sans-serif" : undefined,
                        fontWeight: item.tagWeight || undefined,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Short description */}
              {item.description && (
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="text-base sm:text-lg leading-relaxed mb-8"
                  style={{
                    color: item.descColor || "var(--text)",
                    opacity: item.descColor ? 1 : 0.8,
                    fontFamily: item.descFont ? item.descFont + ", sans-serif" : undefined,
                    fontWeight: item.descWeight || undefined,
                  }}
                >
                  {item.description}
                </motion.p>
              )}

              {/* Action buttons */}
              {(item.liveUrl || item.repoUrl) && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex gap-3 mb-12"
                >
                  {item.liveUrl && (
                    <a
                      href={item.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                      style={{
                        backgroundColor: item.liveBtnBg || theme.accentColor,
                        color: item.liveBtnColor || theme.backgroundColor,
                        fontFamily: item.liveBtnFont ? item.liveBtnFont + ", sans-serif" : undefined,
                        fontWeight: item.liveBtnWeight || undefined,
                      }}
                    >
                      <FiExternalLink size={16} /> View Live
                    </a>
                  )}
                  {item.repoUrl && (
                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-all hover:scale-105"
                      style={{
                        borderColor: item.repoBtnBg ? item.repoBtnBg : `${theme.accentColor}40`,
                        color: item.repoBtnColor || "var(--text)",
                        backgroundColor: item.repoBtnBg || undefined,
                        fontFamily: item.repoBtnFont ? item.repoBtnFont + ", sans-serif" : undefined,
                        fontWeight: item.repoBtnWeight || undefined,
                      }}
                    >
                      <FiGithub size={16} /> Source Code
                    </a>
                  )}
                </motion.div>
              )}

              {/* Cover image (large) */}
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="mb-12"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden border" style={{ borderColor: theme.surfaceColor }}>
                    <Image
                      src={images[0].src}
                      alt={images[0].desc || item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 896px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  {images[0].desc && (
                    <p className="text-sm mt-3 text-center" style={{ color: "var(--text)", opacity: 0.6 }}>
                      {images[0].desc}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Long description */}
              {item.longDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-12"
                >
                  <div
                    className="text-sm sm:text-base leading-relaxed whitespace-pre-line"
                    style={{ color: "var(--text)", opacity: 0.85 }}
                  >
                    {item.longDescription}
                  </div>
                </motion.div>
              )}

              {/* Video */}
              {item.videoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-12"
                >
                  <div className="aspect-video rounded-xl overflow-hidden border" style={{ borderColor: theme.surfaceColor }}>
                    <iframe
                      src={item.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {item.videoDesc && (
                    <p className="text-sm mt-3 text-center" style={{ color: "var(--text)", opacity: 0.6 }}>
                      {item.videoDesc}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Additional images */}
              {images.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12"
                >
                  {images.slice(1).map((img, i) => (
                    <div key={i}>
                      <div className="relative aspect-video rounded-xl overflow-hidden border" style={{ borderColor: theme.surfaceColor }}>
                        <Image
                          src={img.src}
                          alt={img.desc || `${item.title} — image ${i + 2}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 448px"
                          className="object-cover"
                        />
                      </div>
                      {img.desc && (
                        <p className="text-sm mt-2 text-center" style={{ color: "var(--text)", opacity: 0.6 }}>
                          {img.desc}
                        </p>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Code snippet */}
              {item.codeContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-12"
                >
                  <pre
                    className="rounded-xl p-6 overflow-x-auto text-sm border"
                    style={{ backgroundColor: theme.surfaceColor, borderColor: theme.surfaceColor }}
                  >
                    <code>{item.codeContent}</code>
                  </pre>
                </motion.div>
              )}
            </div>
          </section>

          <Contact
            title={siteContent?.contactTitle || "Get in Touch"}
            subtitle={siteContent?.contactSubtitle || ""}
            links={contactLinks}
            accent={theme.accentColor}
            username={user.username}
            titleColor={siteContent?.contactTitleColor}
            titleFont={siteContent?.contactTitleFont}
            titleWeight={siteContent?.contactTitleWeight}
            subtitleColor={siteContent?.contactSubColor}
            subtitleFont={siteContent?.contactSubFont}
            subtitleWeight={siteContent?.contactSubWeight}
          />
          <Footer
            name={`${user.firstName} ${user.lastName}`}
            footerText={siteContent?.footerText || ""}
            textColor={siteContent?.footerTextColor}
            textFont={siteContent?.footerTextFont}
            textWeight={siteContent?.footerTextWeight}
          />
        </div>
      </div>
    </>
  );
}
