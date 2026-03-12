"use client";

import { useState } from "react";
import LoadingScreen from "./LoadingScreen";
import CustomCursor from "./CustomCursor";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import SectionBlock from "./SectionBlock";
import Contact from "./Contact";
import Footer from "./Footer";
import ProjectModal from "./ProjectModal";

export interface ThemeData {
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  dangerColor: string;
  cursorColor: string;
  bodyFont: string;
  headingFont: string;
  logoUrl: string;
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
}

export interface NavLinkData {
  id: string;
  label: string;
  href: string;
}

export interface ContactLinkData {
  id: string;
  platform: string;
  url: string;
}

export interface ContentItemData {
  id: string;
  title: string;
  description: string;
  tags: string;
  coverImage: string;
  image1: string;
  image2: string;
  image3: string;
  liveUrl: string;
  repoUrl: string;
}

export interface SectionData {
  id: string;
  name: string;
  slug: string;
  label: string;
  subtitle: string;
  backgroundColor: string;
  contentItems: ContentItemData[];
}

interface PortfolioClientProps {
  user: { firstName: string; lastName: string; username: string };
  theme: ThemeData | null;
  siteContent: SiteContentData | null;
  navLinks: NavLinkData[];
  contactLinks: ContactLinkData[];
  sections: SectionData[];
}

const defaults: ThemeData = {
  accentColor: "#70E844", backgroundColor: "#131313", surfaceColor: "#181818",
  textColor: "#fafafa", dangerColor: "#FE454E", cursorColor: "#70E844",
  bodyFont: "Inter", headingFont: "Syne", logoUrl: "", faviconUrl: "",
  webclipUrl: "", websiteTitle: "", gridColor: "rgba(255,255,255,0.03)",
};

function googleFontUrl(fonts: string[]): string {
  const unique = Array.from(new Set(fonts)).filter(Boolean);
  const families = unique.map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export default function PortfolioClient({
  user, theme: rawTheme, siteContent, navLinks, contactLinks, sections,
}: PortfolioClientProps) {
  const theme = { ...defaults, ...Object.fromEntries(
    Object.entries(rawTheme || {}).filter(([, v]) => v !== null && v !== "")
  ) } as ThemeData;

  const [modalItem, setModalItem] = useState<ContentItemData | null>(null);

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
      <link href={googleFontUrl([theme.bodyFont, theme.headingFont])} rel="stylesheet" />
      {theme.faviconUrl && <link rel="icon" href={theme.faviconUrl} />}

      <div
        style={{ ...cssVars, backgroundColor: "var(--bg)", color: "var(--text)" }}
        className="min-h-screen relative"
      >
        {/* Grid overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-[1]"
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

        <LoadingScreen
          heading={siteContent?.loadingHeading || `${user.firstName} ${user.lastName}`}
          subtitle={siteContent?.loadingSubtitle || "Portfolio"}
          accent={theme.accentColor}
          headingFont={theme.headingFont}
        />
        <CustomCursor cursorColor={theme.cursorColor} />
        <Navbar
          logoUrl={theme.logoUrl}
          logoText={siteContent?.logoText || `${user.firstName} ${user.lastName}`}
          navLinks={navLinks}
          accent={theme.accentColor}
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
        />
        {(siteContent?.aboutText || siteContent?.skills) && (
          <About
            aboutText={siteContent?.aboutText || ""}
            skills={siteContent?.skills || ""}
            accent={theme.accentColor}
            surface={theme.surfaceColor}
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
        <Contact
          title={siteContent?.contactTitle || "Get in Touch"}
          subtitle={siteContent?.contactSubtitle || ""}
          links={contactLinks}
          accent={theme.accentColor}
        />
        <Footer
          name={`${user.firstName} ${user.lastName}`}
          footerText={siteContent?.footerText || ""}
        />
        <ProjectModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          accent={theme.accentColor}
        />
      </div>
    </>
  );
}
