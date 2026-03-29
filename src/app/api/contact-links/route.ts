import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserId } from "@/lib/api-auth";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.contactLink.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { platform, url, iconBgColor, iconColor } = body;

  if (!platform) return NextResponse.json({ error: "Platform is required" }, { status: 400 });
  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  const maxOrder = await prisma.contactLink.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const link = await prisma.contactLink.create({
    data: {
      userId,
      platform,
      url,
      order: (maxOrder?.order ?? -1) + 1,
      ...(iconBgColor !== undefined && { iconBgColor }),
      ...(iconColor !== undefined && { iconColor }),
    },
  });

  return NextResponse.json(link, { status: 201 });
}
