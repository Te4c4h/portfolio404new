import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const sessionUser = await requireAuth();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      subscriptionStatus: true,
      currentPeriodEnd: true,
      isFreeAccess: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd,
    isFreeAccess: user.isFreeAccess,
    hasAccess: user.subscriptionStatus === "active" || user.isFreeAccess,
  });
}
