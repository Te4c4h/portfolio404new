import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserId, getSessionUser } from "@/lib/api-auth";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sections = await prisma.section.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, label, subtitle, backgroundColor,
    nameColor, nameFont, nameWeight,
    labelColor, labelFont, labelWeight,
    subtitleColor, subtitleFont, subtitleWeight,
  } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Enforce max 4 sections per user (admins are exempt)
  const sessionUser = await getSessionUser();
  if (!sessionUser?.isAdmin) {
    const count = await prisma.section.count({ where: { userId } });
    if (count >= 4) {
      return NextResponse.json({ error: "Maximum 4 sections allowed" }, { status: 400 });
    }
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await prisma.section.findUnique({
    where: { userId_slug: { userId, slug } },
  });
  if (existing) {
    return NextResponse.json({ error: "A section with this name already exists" }, { status: 409 });
  }

  const maxOrder = await prisma.section.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const section = await prisma.section.create({
    data: {
      userId,
      name,
      slug,
      label: label || name,
      subtitle: subtitle || "",
      backgroundColor: backgroundColor || "#181818",
      order: (maxOrder?.order ?? -1) + 1,
      ...(nameColor !== undefined && { nameColor }),
      ...(nameFont !== undefined && { nameFont }),
      ...(nameWeight !== undefined && { nameWeight }),
      ...(labelColor !== undefined && { labelColor }),
      ...(labelFont !== undefined && { labelFont }),
      ...(labelWeight !== undefined && { labelWeight }),
      ...(subtitleColor !== undefined && { subtitleColor }),
      ...(subtitleFont !== undefined && { subtitleFont }),
      ...(subtitleWeight !== undefined && { subtitleWeight }),
    },
  });

  return NextResponse.json(section, { status: 201 });
}
