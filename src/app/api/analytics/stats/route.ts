import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const username = user.isAdmin ? "__home__" : user.username;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total views & unique (approximate unique by counting distinct days)
  const [
    totalViews,
    viewsThisMonth,
    viewsLastMonth,
    dailyViews,
    contactClicks,
    sectionData,
  ] = await Promise.all([
    // Total page views all time
    prisma.pageView.count({ where: { username } }),

    // Views this month
    prisma.pageView.count({
      where: { username, timestamp: { gte: startOfMonth } },
    }),

    // Views last month
    prisma.pageView.count({
      where: {
        username,
        timestamp: { gte: startOfLastMonth, lt: startOfMonth },
      },
    }),

    // Daily views for last 30 days
    prisma.pageView.findMany({
      where: { username, timestamp: { gte: thirtyDaysAgo } },
      select: { timestamp: true },
      orderBy: { timestamp: "asc" },
    }),

    // Contact clicks grouped by type
    prisma.contactClick.groupBy({
      by: ["contactType"],
      where: { username },
      _count: { id: true },
    }),

    // Section and content stats
    prisma.user.findFirst({
      where: { username },
      select: {
        sections: {
          select: { name: true, _count: { select: { contentItems: true } } },
          orderBy: { order: "asc" },
        },
        _count: { select: { sections: true, contentItems: true } },
        siteContent: { select: { updatedAt: true } },
      },
    }),
  ]);

  // Aggregate daily views into { date: count } for chart
  const dailyMap: Record<string, number> = {};
  for (let d = 0; d < 30; d++) {
    const date = new Date(thirtyDaysAgo.getTime() + d * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    dailyMap[key] = 0;
  }
  for (const v of dailyViews as { timestamp: Date }[]) {
    const key = v.timestamp.toISOString().slice(0, 10);
    if (dailyMap[key] !== undefined) dailyMap[key]++;
  }

  const dailyChart = Object.entries(dailyMap).map(([date, views]) => ({
    date,
    views,
  }));

  // Unique visitors (approximate: distinct dates with views)
  const uniqueDays = new Set(
    (dailyViews as { timestamp: Date }[]).map((v) => v.timestamp.toISOString().slice(0, 10))
  );

  // Contact clicks formatted
  const contactStats = (contactClicks as { contactType: string; _count: { id: number } }[]).map((c) => ({
    type: c.contactType,
    clicks: c._count.id,
  }));

  // Month-over-month change
  const monthChange =
    viewsLastMonth > 0
      ? Math.round(((viewsThisMonth - viewsLastMonth) / viewsLastMonth) * 100)
      : viewsThisMonth > 0
      ? 100
      : 0;

  // Most viewed section (by content count as proxy)
  const sections = sectionData?.sections as { name: string; _count: { contentItems: number } }[] | undefined;
  const mostViewedSection = sections?.reduce(
    (best: { name: string; _count: { contentItems: number } } | undefined, s) =>
      s._count.contentItems > (best?._count.contentItems || 0) ? s : best,
    sections[0]
  );

  return NextResponse.json({
    totalViews,
    uniqueVisitors: uniqueDays.size,
    viewsThisMonth,
    viewsLastMonth,
    monthChange,
    dailyChart,
    contactStats,
    sectionsCount: sectionData?._count.sections || 0,
    contentCount: sectionData?._count.contentItems || 0,
    mostViewedSection: mostViewedSection?.name || null,
    lastUpdated: sectionData?.siteContent?.updatedAt || null,
    portfolioUrl: `${process.env.NEXTAUTH_URL || "https://portfolio404new.vercel.app"}/u/${username}`,
  });
}
