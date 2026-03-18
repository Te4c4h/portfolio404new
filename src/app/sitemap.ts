import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.portfolio404.site";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/catalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Published user portfolios
  const users = await prisma.user.findMany({
    where: {
      isPublished: true,
      isBlocked: false,
      OR: [
        { subscriptionStatus: "active" },
        { isFreeAccess: true },
      ],
    },
    select: { username: true, registeredAt: true },
  });

  const userPages: MetadataRoute.Sitemap = users.map((user) => ({
    url: `${baseUrl}/u/${user.username}`,
    lastModified: user.registeredAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...userPages];
}
