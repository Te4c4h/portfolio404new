import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.navLink.findMany({
    where: { userId: user.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { label, href } = body;

  if (!label || !href) {
    return NextResponse.json({ error: "Label and href are required" }, { status: 400 });
  }

  const maxOrder = await prisma.navLink.findFirst({
    where: { userId: user.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const link = await prisma.navLink.create({
    data: {
      userId: user.id,
      label,
      href,
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(link, { status: 201 });
}
