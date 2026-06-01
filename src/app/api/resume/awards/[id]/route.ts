import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, issuer, date, description } = body;

  const data: Record<string, string> = {};
  if (title !== undefined) data.title = title;
  if (issuer !== undefined) data.issuer = issuer;
  if (date !== undefined) data.date = date;
  if (description !== undefined) data.description = description;

  const updated = await prisma.resumeAward.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.resumeAward.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
