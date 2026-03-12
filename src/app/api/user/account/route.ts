import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Prevent admin from deleting their own account
  if (user.isAdmin) {
    return NextResponse.json({ error: "Admin account cannot be deleted" }, { status: 403 });
  }

  // Delete all user data and the user in a transaction
  await prisma.$transaction([
    prisma.contactLink.deleteMany({ where: { userId: user.id } }),
    prisma.navLink.deleteMany({ where: { userId: user.id } }),
    prisma.contentItem.deleteMany({ where: { userId: user.id } }),
    prisma.section.deleteMany({ where: { userId: user.id } }),
    prisma.siteContent.deleteMany({ where: { userId: user.id } }),
    prisma.theme.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  return NextResponse.json({ success: true });
}
