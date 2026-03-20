import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserId } from "@/lib/api-auth";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const siteContent = await prisma.siteContent.findUnique({
    where: { userId },
  });

  return NextResponse.json(siteContent);
}

export async function PUT(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Only update fields that are explicitly present in the request body.
  // This prevents one sub-page from zeroing out fields managed by another.
  const allowedFields = [
    "siteTitle", "logoText", "headline", "subtext",
    "ctaLabel1", "ctaTarget1", "ctaLabel2", "ctaTarget2",
    "aboutText", "skills", "contactTitle", "contactSubtitle",
    "footerText", "loadingHeading", "loadingSubtitle", "loadingScreenEnabled",
    "logoUrl", "useLogoImage",
  ];

  const update: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) {
      update[key] = body[key];
    }
  }

  const siteContent = await prisma.siteContent.upsert({
    where: { userId },
    update,
    create: {
      userId,
      ...update,
    },
  });

  return NextResponse.json(siteContent);
}
