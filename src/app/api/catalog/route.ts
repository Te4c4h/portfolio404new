import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HOME_USERNAME } from "@/lib/home-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await prisma.user.findMany({
    where: {
      isPublished: true,
      isBlocked: false,
      username: { notIn: [HOME_USERNAME, "admin"] },
      OR: [
        { subscriptionStatus: "active" },
        { isFreeAccess: true },
      ],
    },
    select: {
      username: true,
      firstName: true,
      lastName: true,
      registeredAt: true,
      theme: { select: { accentColor: true, webclipUrl: true } },
      siteContent: { select: { headline: true, subtext: true } },
      _count: { select: { sections: true, contentItems: true } },
    },
    orderBy: { registeredAt: "desc" },
  });

  return NextResponse.json(users);
}
