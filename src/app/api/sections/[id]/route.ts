import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserId } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const section = await prisma.section.findUnique({ where: { id: params.id } });
  if (!section || section.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, label, subtitle, backgroundColor,
    nameColor, nameFont, nameWeight,
    labelColor, labelFont, labelWeight,
    subtitleColor, subtitleFont, subtitleWeight,
  } = body;

  const data: Record<string, string> = {};
  if (name !== undefined) {
    data.name = name;
    data.slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  if (label !== undefined) data.label = label;
  if (subtitle !== undefined) data.subtitle = subtitle;
  if (backgroundColor !== undefined) data.backgroundColor = backgroundColor;
  if (nameColor !== undefined) data.nameColor = nameColor;
  if (nameFont !== undefined) data.nameFont = nameFont;
  if (nameWeight !== undefined) data.nameWeight = nameWeight;
  if (labelColor !== undefined) data.labelColor = labelColor;
  if (labelFont !== undefined) data.labelFont = labelFont;
  if (labelWeight !== undefined) data.labelWeight = labelWeight;
  if (subtitleColor !== undefined) data.subtitleColor = subtitleColor;
  if (subtitleFont !== undefined) data.subtitleFont = subtitleFont;
  if (subtitleWeight !== undefined) data.subtitleWeight = subtitleWeight;

  const updated = await prisma.section.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const section = await prisma.section.findUnique({ where: { id: params.id } });
  if (!section || section.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.contentItem.deleteMany({ where: { sectionId: params.id } });
  await prisma.section.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
