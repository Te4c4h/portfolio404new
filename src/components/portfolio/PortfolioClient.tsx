"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";
import CustomCursor from "./CustomCursor";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import SectionBlock from "./SectionBlock";
import Contact from "./Contact";
import Footer from "./Footer";
import ProjectModal from "./ProjectModal";
import ResumeSection, { ResumeData } from "./ResumeSection";
import PricingSection from "@/components/PricingSection";

export interface ThemeData {
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  dangerColor: string;
  cursorColor: string;
  bodyFont: string;
  headingFont: string;
  faviconUrl: string;
  webclipUrl: string;
  websiteTitle: string;
  gridColor: string;
}

export interface SiteContentData {
  siteTitle: string;
  logoText: string;
  headline: string;
  subtext: string;
  ctaLabel1: string;
  ctaTarget1: string;
  ctaLabel2: string;
  ctaTarget2: string;
  aboutText: string;
  skills: string;
  contactTitle: string;
  contactSubtitle: string;
  footerText: string;
  loadingHeading: string;
  loadingSubtitle: string;
  loadingScreenEnabled: boolean;
  logoUrl: string;
  useLogoImage: boolean;
  // N-1
  navScrollBg?: string;
  // Hamburger menu color
  hamburgerColor?: string;
  // N-3
  logoTextColor?: string;
  logoTextFont?: string;
  logoTextWeight?: string;
  // H-1
  headlineColor?: string;
  headlineFont?: string;
  headlineWeight?: string;
  subtextColor?: string;
  subtextFont?: string;
  subtextWeight?: string;
  // H-2
  ctaBg1?: string;
  ctaTextColor1?: string;
  ctaFont1?: string;
  ctaWeight1?: string;
  ctaBg2?: string;
  ctaTextColor2?: string;
  ctaFont2?: string;
  ctaWeight2?: string;
  // About heading
  aboutHeading?: string;
  aboutHeadingColor?: string;
  aboutHeadingFont?: string;
  aboutHeadingWeight?: string;
  // A-1
  aboutTextColor?: string;
  aboutTextFont?: string;
  aboutTextWeight?: string;
  // A-2
  skillTagBg?: string;
  skillTagColor?: string;
  skillTagFont?: string;
  skillTagWeight?: string;
  // CT-1
  contactTitleColor?: string;
  contactTitleFont?: string;
  contactTitleWeight?: string;
  contactSubColor?: string;
  contactSubFont?: string;
  contactSubWeight?: string;
  // F-1
  footerTextColor?: string;
  footerTextFont?: string;
  footerTextWeight?: string;
  // L-1
  loadingHeadingColor?: string;
  loadingHeadingFont?: string;
  loadingHeadingWeight?: string;
  loadingSubColor?: string;
  loadingSubFont?: string;
  loadingSubWeight?: string;
  // L-2
  loadingBgColor?: string;
  // L-3
  loadingDuration?: number;
}

export interface NavLinkData {
  id: string;
  label: string;
  href: string;
  labelColor?: string;
  labelFont?: string;
  labelWeight?: string;
}

export interface ContactLinkData {
  id: string;
  platform: string;
  url: string;
  iconBgColor?: string;
  iconColor?: string;
}

export interface ContentItemData {
  id: string;
  contentType: string;
  title: string;
  description: string;
  tags: string;
  coverImage: string;
  image1: string;
  image2: string;
  image3: string;
  liveUrl: string;
  repoUrl: string;
  videoUrl: string;
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
}

export interface SectionData {
  id: string;
  name: string;
  slug: string;
  label: string;
  subtitle: string;
  backgroundColor: string;
  contentItems: ContentItemData[];
  nameColor?: string;
  nameFont?: string;
  nameWeight?: string;
  labelColor?: string;
  labelFont?: string;
  labelWeight?: string;
  subtitleColor?: string;
  subtitleFont?: string;
  subtitleWeight?: string;
}

interface PortfolioClientProps {
  user: { firstName: string; lastName: string; username: string };
  theme: ThemeData | null;
  siteContent: SiteContentData | null;
  navLinks: NavLinkData[];
  contactLinks: ContactLinkData[];
  sections: SectionData[];
  resume?: ResumeData | null;
}

const defaults: ThemeData = {
  accentColor: "#70E844", backgroundColor: "#131313", surfaceColor: "#181818",
  textColor: "#fafafa", dangerColor: "#FE454E", cursorColor: "#70E844",
  bodyFont: "Inter", headingFont: "Syne", faviconUrl: "",
  webclipUrl: "", websiteTitle: "", gridColor: "rgba(255,255,255,0.03)",
};

function FaviconSetter({ url }: { url: string }) {
  useEffect(() => {
    if (!url) return;
    // Remove any existing favicons
    const existing = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");
    existing.forEach((el) => el.remove());
    // Add new favicon
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = url;
    if (url.endsWith(".png")) link.type = "image/png";
    else if (url.endsWith(".ico")) link.type = "image/x-icon";
    document.head.appendChild(link);
  }, [url]);
  return null;
}

function googleFontUrl(fonts: string[]): string {
  const unique = Array.from(new Set(fonts)).filter(Boolean);
  const families = unique.map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export default function PortfolioClient({
  user, theme: rawTheme, siteContent, navLinks, contactLinks, sections, resume,
}: PortfolioClientProps) {
  const theme = { ...defaults, ...Object.fromEntries(
    Object.entries(rawTheme || {}).filter(([, v]) => v !== null && v !== "")
  ) } as ThemeData;

  const [modalItem, setModalItem] = useState<ContentItemData | null>(null);

  // Track page view on mount (prevent double-fire in React 18 Strict Mode and across fast refreshes)
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

  const firstSectionSlug = sections[0]?.slug || "";
  const ctaTarget1 = siteContent?.ctaTarget1 || (firstSectionSlug ? `#${firstSectionSlug}` : "#");
  const ctaTarget2 = siteContent?.ctaTarget2 || "#contact";

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

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={googleFontUrl([
        theme.bodyFont, theme.headingFont,
        // Collect all custom font overrides so Google Fonts loads them
        ...[
          siteContent?.logoTextFont, siteContent?.headlineFont, siteContent?.subtextFont,
          siteContent?.ctaFont1, siteContent?.ctaFont2,
          siteContent?.aboutHeadingFont, siteContent?.aboutTextFont, siteContent?.skillTagFont,
          siteContent?.contactTitleFont, siteContent?.contactSubFont,
          siteContent?.footerTextFont,
          siteContent?.loadingHeadingFont, siteContent?.loadingSubFont,
        ].filter(Boolean) as string[],
        ...navLinks.map((l) => l.labelFont).filter(Boolean) as string[],
        ...sections.flatMap((s) => [
          s.nameFont, s.labelFont, s.subtitleFont,
          ...s.contentItems.flatMap((c) => [
            c.titleFont, c.descFont, c.tagFont,
            c.liveBtnFont, c.repoBtnFont,
          ]),
        ]).filter(Boolean) as string[],
      ])} rel="stylesheet" />
      <FaviconSetter url={theme.faviconUrl} />

      <div
        style={{ ...cssVars, backgroundColor: "var(--bg)", color: "var(--text)" }}
        className="min-h-screen relative"
      >
        {/* Grid overlay — z-[2] sits between section backgrounds and content */}
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
          {(siteContent?.loadingScreenEnabled !== false) && (
            <LoadingScreen
              heading={siteContent?.loadingHeading || `${user.firstName} ${user.lastName}`}
              subtitle={siteContent?.loadingSubtitle || "Portfolio"}
              accent={theme.accentColor}
              headingFont={theme.headingFont}
              headingColor={siteContent?.loadingHeadingColor}
              headingFontOverride={siteContent?.loadingHeadingFont}
              headingWeight={siteContent?.loadingHeadingWeight}
              subColor={siteContent?.loadingSubColor}
              subFont={siteContent?.loadingSubFont}
              subWeight={siteContent?.loadingSubWeight}
              bgColor={siteContent?.loadingBgColor}
              duration={siteContent?.loadingDuration}
            />
          )}
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
          <Hero
            headline={siteContent?.headline || ""}
            subtext={siteContent?.subtext || ""}
            ctaLabel1={siteContent?.ctaLabel1 || "View Work"}
            ctaTarget1={ctaTarget1}
            ctaLabel2={siteContent?.ctaLabel2 || "Contact"}
            ctaTarget2={ctaTarget2}
            accent={theme.accentColor}
            bg={theme.backgroundColor}
            headlineColor={siteContent?.headlineColor}
            headlineFont={siteContent?.headlineFont}
            headlineWeight={siteContent?.headlineWeight}
            subtextColor={siteContent?.subtextColor}
            subtextFont={siteContent?.subtextFont}
            subtextWeight={siteContent?.subtextWeight}
            ctaBg1={siteContent?.ctaBg1}
            ctaTextColor1={siteContent?.ctaTextColor1}
            ctaFont1={siteContent?.ctaFont1}
            ctaWeight1={siteContent?.ctaWeight1}
            ctaBg2={siteContent?.ctaBg2}
            ctaTextColor2={siteContent?.ctaTextColor2}
            ctaFont2={siteContent?.ctaFont2}
            ctaWeight2={siteContent?.ctaWeight2}
          />
          {(siteContent?.aboutText || siteContent?.skills) && (
            <About
              aboutText={siteContent?.aboutText || ""}
              skills={siteContent?.skills || ""}
              accent={theme.accentColor}
              surface={theme.surfaceColor}
              aboutHeading={siteContent?.aboutHeading}
              aboutHeadingColor={siteContent?.aboutHeadingColor}
              aboutHeadingFont={siteContent?.aboutHeadingFont}
              aboutHeadingWeight={siteContent?.aboutHeadingWeight}
              aboutTextColor={siteContent?.aboutTextColor}
              aboutTextFont={siteContent?.aboutTextFont}
              aboutTextWeight={siteContent?.aboutTextWeight}
              skillTagBg={siteContent?.skillTagBg}
              skillTagColor={siteContent?.skillTagColor}
              skillTagFont={siteContent?.skillTagFont}
              skillTagWeight={siteContent?.skillTagWeight}
            />
          )}
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              accent={theme.accentColor}
              surface={theme.surfaceColor}
              defaultBg={theme.backgroundColor}
              onCardClick={setModalItem}
            />
          ))}
          {resume && (
            <ResumeSection
              resume={resume}
              accent={theme.accentColor}
              surface={theme.surfaceColor}
            />
          )}
          <PricingSection />
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
          <ProjectModal
            item={modalItem}
            onClose={() => setModalItem(null)}
            accent={theme.accentColor}
          />
        </div>
      </div>
    </>
  );
}
