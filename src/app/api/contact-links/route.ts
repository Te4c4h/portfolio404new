import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.contactLink.findMany({
    where: { userId: user.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { platform, url } = body;

  if (!platform) return NextResponse.json({ error: "Platform is required" }, { status: 400 });
  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  const maxOrder = await prisma.contactLink.findFirst({
    where: { userId: user.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const link = await prisma.contactLink.create({
    data: {
      userId: user.id,
      platform,
      url,
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(link, { status: 201 });
}
