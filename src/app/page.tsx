import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HOME_USERNAME } from "@/lib/home-user";
import PortfolioClient from "@/components/portfolio/PortfolioClient";
import DefaultLandingPage from "@/components/DefaultLandingPage";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const user = await prisma.user.findUnique({
    where: { username: HOME_USERNAME },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
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

  return user;
}

const baseUrl = process.env.NEXTAUTH_URL || "https://portfolio404new.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomeData();
  if (!data) return { title: "Portfolio 404 — Build Your Personal Portfolio" };

  const title = data.siteContent?.siteTitle || "Portfolio 404 — Build Your Personal Portfolio";
  const description = data.siteContent?.subtext || "Create a stunning personal portfolio in minutes. Free to start. No coding required.";
  const ogImage = data.theme?.webclipUrl || `${baseUrl}/og-image.png`;

  return {
    title,
    description,
    ...(data.theme?.faviconUrl ? { icons: { icon: data.theme.faviconUrl } } : {}),
    openGraph: {
      title,
      description,
      url: baseUrl,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function HomePage() {
  const data = await getHomeData();
  
  // Show default landing page if no home user exists
  if (!data) {
    return <DefaultLandingPage />;
  }

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
