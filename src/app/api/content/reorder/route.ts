import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { items } = body as { items: { id: string; order: number }[] };

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: "Items array is required" }, { status: 400 });
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.contentItem.updateMany({
        where: { id: item.id, userId: user.id },
        data: { order: item.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
