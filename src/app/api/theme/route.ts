import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const theme = await prisma.theme.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json(theme);
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    accentColor, backgroundColor, surfaceColor, textColor,
    dangerColor, cursorColor, bodyFont, headingFont,
    logoUrl, faviconUrl, webclipUrl, websiteTitle, gridColor,
  } = body;

  const data = {
    accentColor: accentColor ?? "#70E844",
    backgroundColor: backgroundColor ?? "#131313",
    surfaceColor: surfaceColor ?? "#181818",
    textColor: textColor ?? "#fafafa",
    dangerColor: dangerColor ?? "#FE454E",
    cursorColor: cursorColor ?? "#70E844",
    bodyFont: bodyFont ?? "Inter",
    headingFont: headingFont ?? "Syne",
    logoUrl: logoUrl ?? "",
    faviconUrl: faviconUrl ?? "",
    webclipUrl: webclipUrl ?? "",
    websiteTitle: websiteTitle ?? "",
    gridColor: gridColor ?? "rgba(255,255,255,0.03)",
  };

  const theme = await prisma.theme.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });

  return NextResponse.json(theme);
}
