import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sectionId = req.nextUrl.searchParams.get("sectionId");

  const where: { userId: string; sectionId?: string } = { userId: user.id };
  if (sectionId) where.sectionId = sectionId;

  const items = await prisma.contentItem.findMany({
    where,
    orderBy: { order: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, sectionId, tags, coverImage, image1, image2, image3, liveUrl, repoUrl } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
  if (!sectionId) return NextResponse.json({ error: "Section is required" }, { status: 400 });

  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section || section.userId !== user.id) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const maxOrder = await prisma.contentItem.findFirst({
    where: { sectionId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const item = await prisma.contentItem.create({
    data: {
      userId: user.id,
      sectionId,
      title,
      description: description || "",
      tags: tags || "",
      coverImage: coverImage || "",
      image1: image1 || "",
      image2: image2 || "",
      image3: image3 || "",
      liveUrl: liveUrl || "",
      repoUrl: repoUrl || "",
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
