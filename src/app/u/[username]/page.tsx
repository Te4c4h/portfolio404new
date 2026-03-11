import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PortfolioClient from "@/components/portfolio/PortfolioClient";

async function getPortfolioData(username: string) {
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

  const title =
    data.siteContent?.siteTitle ||
    `${data.firstName} ${data.lastName}`;
  const description =
    data.siteContent?.subtext || `Portfolio of ${data.firstName} ${data.lastName}`;
  const ogImage = data.theme?.webclipUrl || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage && { images: [{ url: ogImage }] }),
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
