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
    // N-1: Sticky navbar bg
    "navScrollBg",
    // N-3: Brand text styling
    "logoTextColor", "logoTextFont", "logoTextWeight",
    // H-1: Headline & subtext styling
    "headlineColor", "headlineFont", "headlineWeight",
    "subtextColor", "subtextFont", "subtextWeight",
    // H-2: CTA button styling
    "ctaBg1", "ctaTextColor1", "ctaFont1", "ctaWeight1",
    "ctaBg2", "ctaTextColor2", "ctaFont2", "ctaWeight2",
    // A-1: About text styling
    "aboutTextColor", "aboutTextFont", "aboutTextWeight",
    // A-2: Skills tag styling
    "skillTagBg", "skillTagColor", "skillTagFont", "skillTagWeight",
    // CT-1: Contact title/subtitle styling
    "contactTitleColor", "contactTitleFont", "contactTitleWeight",
    "contactSubColor", "contactSubFont", "contactSubWeight",
    // F-1: Footer text styling
    "footerTextColor", "footerTextFont", "footerTextWeight",
    // L-1: Loading heading/subtitle styling
    "loadingHeadingColor", "loadingHeadingFont", "loadingHeadingWeight",
    "loadingSubColor", "loadingSubFont", "loadingSubWeight",
    // L-2: Loading bg color, L-3: duration
    "loadingBgColor", "loadingDuration",
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
