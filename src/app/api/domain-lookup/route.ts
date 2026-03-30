import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Internal API: look up username by custom domain
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) {
    return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { customDomain: domain.toLowerCase() },
    select: { username: true, isBlocked: true, isPublished: true, isPaid: true, isFreeAccess: true },
  });

  if (!user || user.isBlocked || !user.isPublished) {
    return NextResponse.json({ username: null });
  }

  if (!user.isPaid && !user.isFreeAccess) {
    return NextResponse.json({ username: null });
  }

  return NextResponse.json({ username: user.username });
}
