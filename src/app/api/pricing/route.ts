import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

async function getOrCreate() {
  let config = await prisma.pricingConfig.findFirst();
  if (!config) {
    config = await prisma.pricingConfig.create({
      data: {},
    });
  }
  return config;
}

export async function GET() {
  const config = await getOrCreate();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    heading, subtitle,
    headingColor, headingFont, headingWeight, headingAccentColor,
    subtitleColor, subtitleFont, subtitleWeight,
    price, period, tagline, features, ctaLabel,
    priceColor, priceFont, priceWeight,
    periodColor, periodFont, periodWeight,
    taglineColor, taglineFont, taglineWeight,
    featuresColor, featuresFont, featuresWeight, featuresMarkColor,
    cardBgColor,
    ctaColor, ctaFont, ctaWeight, ctaBgColor,
  } = body;

  const config = await getOrCreate();

  const updated = await prisma.pricingConfig.update({
    where: { id: config.id },
    data: {
      ...(heading !== undefined && { heading }),
      ...(subtitle !== undefined && { subtitle }),
      ...(headingColor !== undefined && { headingColor }),
      ...(headingFont !== undefined && { headingFont }),
      ...(headingWeight !== undefined && { headingWeight }),
      ...(headingAccentColor !== undefined && { headingAccentColor }),
      ...(subtitleColor !== undefined && { subtitleColor }),
      ...(subtitleFont !== undefined && { subtitleFont }),
      ...(subtitleWeight !== undefined && { subtitleWeight }),
      ...(price !== undefined && { price }),
      ...(period !== undefined && { period }),
      ...(tagline !== undefined && { tagline }),
      ...(features !== undefined && { features }),
      ...(ctaLabel !== undefined && { ctaLabel }),
      ...(priceColor !== undefined && { priceColor }),
      ...(priceFont !== undefined && { priceFont }),
      ...(priceWeight !== undefined && { priceWeight }),
      ...(periodColor !== undefined && { periodColor }),
      ...(periodFont !== undefined && { periodFont }),
      ...(periodWeight !== undefined && { periodWeight }),
      ...(taglineColor !== undefined && { taglineColor }),
      ...(taglineFont !== undefined && { taglineFont }),
      ...(taglineWeight !== undefined && { taglineWeight }),
      ...(featuresColor !== undefined && { featuresColor }),
      ...(featuresFont !== undefined && { featuresFont }),
      ...(featuresWeight !== undefined && { featuresWeight }),
      ...(featuresMarkColor !== undefined && { featuresMarkColor }),
      ...(cardBgColor !== undefined && { cardBgColor }),
      ...(ctaColor !== undefined && { ctaColor }),
      ...(ctaFont !== undefined && { ctaFont }),
      ...(ctaWeight !== undefined && { ctaWeight }),
      ...(ctaBgColor !== undefined && { ctaBgColor }),
    },
  });

  return NextResponse.json(updated);
}
