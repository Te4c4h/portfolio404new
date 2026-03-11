import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const link = await prisma.navLink.findUnique({ where: { id: params.id } });
  if (!link || link.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { label, href } = body;

  const updated = await prisma.navLink.update({
    where: { id: params.id },
    data: {
      ...(label !== undefined && { label }),
      ...(href !== undefined && { href }),
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

  const link = await prisma.navLink.findUnique({ where: { id: params.id } });
  if (!link || link.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.navLink.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
