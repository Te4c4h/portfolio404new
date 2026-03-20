import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await req.json();

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const trimmed = username.trim().toLowerCase();

  if (trimmed.length < 3 || trimmed.length > 20) {
    return NextResponse.json({ error: "Username must be 3–20 characters" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return NextResponse.json({ error: "Only letters, numbers, hyphens, and underscores" }, { status: 400 });
  }

  if (trimmed === user.username) {
    return NextResponse.json({ error: "That is already your username" }, { status: 400 });
  }

  // Check availability
  const existing = await prisma.user.findUnique({ where: { username: trimmed } });
  if (existing) {
    return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
  }

  // Update username and analytics records
  const oldUsername = user.username;
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { username: trimmed } }),
    prisma.pageView.updateMany({ where: { username: oldUsername }, data: { username: trimmed } }),
    prisma.contactClick.updateMany({ where: { username: oldUsername }, data: { username: trimmed } }),
  ]);

  return NextResponse.json({ username: trimmed });
}
