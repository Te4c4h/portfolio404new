import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sections = await prisma.section.findMany({
    where: { userId: user.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, label, subtitle, backgroundColor } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await prisma.section.findUnique({
    where: { userId_slug: { userId: user.id, slug } },
  });
  if (existing) {
    return NextResponse.json({ error: "A section with this name already exists" }, { status: 409 });
  }

  const maxOrder = await prisma.section.findFirst({
    where: { userId: user.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const section = await prisma.section.create({
    data: {
      userId: user.id,
      name,
      slug,
      label: label || name,
      subtitle: subtitle || "",
      backgroundColor: backgroundColor || "#181818",
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(section, { status: 201 });
}
