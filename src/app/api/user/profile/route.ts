import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { firstName: true, lastName: true, username: true, email: true, password: true },
  });

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    username: dbUser.username,
    email: dbUser.email,
    isOAuth: !dbUser.password,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { firstName, lastName } = await req.json();

  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json({ error: "First and last name are required" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { firstName: firstName.trim(), lastName: lastName.trim() },
    select: { firstName: true, lastName: true },
  });

  return NextResponse.json(updated);
}
