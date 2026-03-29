import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserId } from "@/lib/api-auth";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.navLink.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { label, href, labelColor, labelFont, labelWeight } = body;

  if (!label || !href) {
    return NextResponse.json({ error: "Label and href are required" }, { status: 400 });
  }

  const maxOrder = await prisma.navLink.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const link = await prisma.navLink.create({
    data: {
      userId,
      label,
      href,
      order: (maxOrder?.order ?? -1) + 1,
      ...(labelColor !== undefined && { labelColor }),
      ...(labelFont !== undefined && { labelFont }),
      ...(labelWeight !== undefined && { labelWeight }),
    },
  });

  return NextResponse.json(link, { status: 201 });
}
