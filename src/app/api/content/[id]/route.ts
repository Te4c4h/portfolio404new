import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.contentItem.findUnique({ where: { id: params.id } });
  if (!item || item.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, tags, coverImage, image1, image2, image3, liveUrl, repoUrl, sectionId } = body;

  const data: Record<string, string> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (tags !== undefined) data.tags = tags;
  if (coverImage !== undefined) data.coverImage = coverImage;
  if (image1 !== undefined) data.image1 = image1;
  if (image2 !== undefined) data.image2 = image2;
  if (image3 !== undefined) data.image3 = image3;
  if (liveUrl !== undefined) data.liveUrl = liveUrl;
  if (repoUrl !== undefined) data.repoUrl = repoUrl;
  if (sectionId !== undefined) data.sectionId = sectionId;

  const updated = await prisma.contentItem.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.contentItem.findUnique({ where: { id: params.id } });
  if (!item || item.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.contentItem.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
