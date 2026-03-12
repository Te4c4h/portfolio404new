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

  if (!user || user.isBlocked) return null;
  return user;
}

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
  const ogImage = data.theme?.webclipUrl || "https://www.portfolio404.site/og-image.png";
  const ogUrl = `https://www.portfolio404.site/u/${params.username}`;

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: ogUrl,
      images: [{ url: ogImage }],
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

  const { theme, siteContent, navLinks, contactLinks, sections } = data;

  return (
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
    />
  );
}
