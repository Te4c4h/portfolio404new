import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await prisma.contactLink.findUnique({ where: { id: params.id } });
  if (!link || link.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { platform, url } = body;

  const updated = await prisma.contactLink.update({
    where: { id: params.id },
    data: {
      ...(platform !== undefined && { platform }),
      ...(url !== undefined && { url }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await prisma.contactLink.findUnique({ where: { id: params.id } });
  if (!link || link.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.contactLink.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
