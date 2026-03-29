import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HOME_USERNAME } from "@/lib/home-user";
import PortfolioClient from "@/components/portfolio/PortfolioClient";

export const dynamic = "force-dynamic";

const BLOCKED_USERNAMES = [HOME_USERNAME, "admin"];

async function getPortfolioData(username: string) {
  if (BLOCKED_USERNAMES.includes(username)) return null;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      isBlocked: true,
      isPublished: true,
      subscriptionStatus: true,
      isFreeAccess: true,
      theme: true,
      siteContent: true,
      navLinks: { orderBy: { order: "asc" } },
      contactLinks: { orderBy: { order: "asc" } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          contentItems: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!user || user.isBlocked || !user.isPublished) return null;

  // Fetch resume if showOnPortfolio is enabled
  const resume = await prisma.resume.findUnique({
    where: { userId: user.id },
    include: {
      experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
    },
  });

  return { ...user, resume: resume?.showOnPortfolio ? resume : null };
}

const baseUrl = process.env.NEXTAUTH_URL || "https://portfolio404new.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const data = await getPortfolioData(params.username);
  if (!data) return { title: "Not Found" };

  const fullName = `${data.firstName} ${data.lastName}`;
  const title = data.siteContent?.siteTitle || `${fullName} — Portfolio`;
  const aboutText = data.siteContent?.aboutText || "";
  const description =
    data.siteContent?.subtext ||
    (aboutText ? aboutText.split("\n")[0].slice(0, 160) : `Portfolio of ${fullName}`);
  const ogTitle = `${fullName} — Portfolio | Portfolio 404`;
  const ogImage = data.theme?.webclipUrl || `${baseUrl}/og-image.png`;
  const ogUrl = `${baseUrl}/u/${params.username}`;

  return {
    title,
    description,
    ...(data.theme?.faviconUrl ? { icons: { icon: data.theme.faviconUrl } } : {}),
    alternates: {
      canonical: ogUrl,
    },
    openGraph: {
      title: ogTitle,
      description,
      url: ogUrl,
      type: "profile",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: { username: string };
}) {
  const data = await getPortfolioData(params.username);
  if (!data) notFound();

  const { theme, siteContent, navLinks, contactLinks, sections, resume } = data;

  const fullName = `${data.firstName} ${data.lastName}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    url: `${baseUrl}/u/${data.username}`,
    ...(resume?.jobTitle ? { jobTitle: resume.jobTitle } : {}),
    ...(resume?.email ? { email: `mailto:${resume.email}` } : {}),
    ...(resume?.website ? { sameAs: [resume.website] } : {}),
    ...(siteContent?.subtext ? { description: siteContent.subtext } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioClient
        user={{
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
        }}
        theme={theme}
        siteContent={siteContent}
        navLinks={navLinks}
        contactLinks={contactLinks}
        sections={sections}
        resume={resume}
      />
    </>
  );
}
