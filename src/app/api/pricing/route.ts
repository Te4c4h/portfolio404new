import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

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
  const { price, period, tagline, features, ctaLabel } = body;

  const config = await getOrCreate();

  const updated = await prisma.pricingConfig.update({
    where: { id: config.id },
    data: {
      ...(price !== undefined && { price }),
      ...(period !== undefined && { period }),
      ...(tagline !== undefined && { tagline }),
      ...(features !== undefined && { features }),
      ...(ctaLabel !== undefined && { ctaLabel }),
    },
  });

  return NextResponse.json(updated);
}
