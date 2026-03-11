import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [sectionsCount, contentCount, siteContent, sections] = await Promise.all([
    prisma.section.count({ where: { userId: user.id } }),
    prisma.contentItem.count({ where: { userId: user.id } }),
    prisma.siteContent.findUnique({
      where: { userId: user.id },
      select: { updatedAt: true },
    }),
    prisma.section.findMany({
      where: { userId: user.id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { contentItems: true } },
      },
    }),
  ]);

  return NextResponse.json({
    sectionsCount,
    contentCount,
    lastUpdated: siteContent?.updatedAt || null,
    contentPerSection: sections.map((s: { name: string; _count: { contentItems: number } }) => ({
      name: s.name,
      count: s._count.contentItems,
    })),
  });
}
