import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resume = await prisma.resume.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  const body = await req.json();
  const { name, issuer, date, url } = body;

  const maxOrder = await prisma.resumeCertification.findFirst({
    where: { resumeId: resume.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const certification = await prisma.resumeCertification.create({
    data: {
      resumeId: resume.id,
      name: name || "",
      issuer: issuer || "",
      date: date || "",
      url: url || "",
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(certification, { status: 201 });
}
