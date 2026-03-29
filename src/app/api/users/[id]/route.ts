import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PUT(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { isBlocked: !user.isBlocked },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      isBlocked: true,
      registeredAt: true,
      subscriptionStatus: true,
      isFreeAccess: true,
      isPaid: true,
    },
  });

  return NextResponse.json(updated);
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { isFreeAccess: !user.isFreeAccess },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      isBlocked: true,
      registeredAt: true,
      subscriptionStatus: true,
      isFreeAccess: true,
      isPaid: true,
    },
  });

  return NextResponse.json(updated);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { isPaid: !user.isPaid },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      isBlocked: true,
      registeredAt: true,
      subscriptionStatus: true,
      isFreeAccess: true,
      isPaid: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
