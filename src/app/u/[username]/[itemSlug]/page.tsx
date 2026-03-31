import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HOME_USERNAME } from "@/lib/home-user";
import ItemDetailClient from "@/components/portfolio/ItemDetailClient";

export const dynamic = "force-dynamic";

const BLOCKED_USERNAMES = [HOME_USERNAME, "admin"];
const RESERVED_SLUGS = ["admin"];

async function getItemData(username: string, itemSlug: string) {
  if (BLOCKED_USERNAMES.includes(username)) return null;
  if (RESERVED_SLUGS.includes(itemSlug)) return null;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      isBlocked: true,
      isPublished: true,
      isPaid: true,
      isFreeAccess: true,
      theme: true,
      siteContent: true,
      navLinks: { orderBy: { order: "asc" } },
      contactLinks: { orderBy: { order: "asc" } },
    },
  });

  if (!user || user.isBlocked || !user.isPublished) return null;
  if (!user.isPaid && !user.isFreeAccess) return null;

  const item = await prisma.contentItem.findFirst({
    where: { userId: user.id, slug: itemSlug },
    include: { section: { select: { name: true, slug: true } } },
  });

  if (!item) return null;

  return { user, item };
}

const baseUrl = process.env.NEXTAUTH_URL || "https://portfolio404.site";

export async function generateMetadata({
  params,
}: {
  params: { username: string; itemSlug: string };
}): Promise<Metadata> {
  const data = await getItemData(params.username, params.itemSlug);
  if (!data) return { title: "Not Found" };

  const { user, item } = data;
  const fullName = `${user.firstName} ${user.lastName}`;
  const title = `${item.title} — ${fullName}`;
  const description = item.description || `${item.title} by ${fullName}`;
  const ogImage = item.coverImage || data.user.theme?.webclipUrl || `${baseUrl}/og-image.png`;
  const ogUrl = `${baseUrl}/u/${params.username}/${params.itemSlug}`;

  return {
    title,
    description,
    ...(user.theme?.faviconUrl ? { icons: { icon: user.theme.faviconUrl } } : {}),
    alternates: { canonical: ogUrl },
    openGraph: {
      title,
      description,
      url: ogUrl,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ItemDetailPage({
  params,
}: {
  params: { username: string; itemSlug: string };
}) {
  const data = await getItemData(params.username, params.itemSlug);
  if (!data) notFound();

  const { user, item } = data;
  const { theme, siteContent, navLinks, contactLinks } = user;

  return (
    <ItemDetailClient
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      }}
      theme={theme}
      siteContent={siteContent}
      navLinks={navLinks}
      contactLinks={contactLinks}
      item={item}
    />
  );
}
