import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import dns from "dns/promises";

// GET — return the user's current custom domain
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { customDomain: true },
  });

  return NextResponse.json({ customDomain: dbUser?.customDomain || null });
}

// PUT — set or update custom domain
export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { domain } = await req.json();

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  // Normalize: lowercase, trim, remove trailing dots, strip protocol/path
  const clean = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");

  // Basic domain format validation
  if (!/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(clean)) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  // Block portfolio404.site and subdomains
  if (clean === "portfolio404.site" || clean.endsWith(".portfolio404.site")) {
    return NextResponse.json({ error: "Cannot use portfolio404.site domain" }, { status: 400 });
  }

  // Check if domain is already taken by another user
  const existing = await prisma.user.findUnique({ where: { customDomain: clean } });
  if (existing && existing.id !== user.id) {
    return NextResponse.json({ error: "This domain is already connected to another account" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { customDomain: clean },
  });

  return NextResponse.json({ customDomain: clean });
}

// DELETE — remove custom domain
export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: user.id },
    data: { customDomain: null },
  });

  return NextResponse.json({ success: true });
}

// Verify DNS — used by the frontend to check if DNS is pointing correctly
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { domain } = await req.json();
  if (!domain) return NextResponse.json({ error: "Domain required" }, { status: 400 });

  const clean = domain.trim().toLowerCase();
  const serverIp = "109.75.40.220";

  try {
    // Check A record
    const aRecords: string[] = await dns.resolve4(clean).catch(() => [] as string[]);
    const aPointsCorrectly = aRecords.includes(serverIp);

    // Check CNAME record
    const cnameRecords: string[] = await dns.resolveCname(clean).catch(() => [] as string[]);
    const cnamePointsCorrectly = cnameRecords.some(
      (r: string) => r === "portfolio404.site" || r === "portfolio404.site."
    );

    const dnsConfigured = aPointsCorrectly || cnamePointsCorrectly;

    return NextResponse.json({
      dnsConfigured,
      aRecords,
      cnameRecords,
      expectedIp: serverIp,
      expectedCname: "portfolio404.site",
    });
  } catch {
    return NextResponse.json({
      dnsConfigured: false,
      error: "Could not resolve DNS records",
    });
  }
}
