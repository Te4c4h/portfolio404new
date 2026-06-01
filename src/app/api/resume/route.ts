import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const includeAll = {
    experiences: { orderBy: { order: "asc" as const } },
    educations: { orderBy: { order: "asc" as const } },
    skills: { orderBy: { order: "asc" as const } },
    languages: { orderBy: { order: "asc" as const } },
    certifications: { orderBy: { order: "asc" as const } },
    awards: { orderBy: { order: "asc" as const } },
  };

  let resume = await prisma.resume.findUnique({
    where: { userId: user.id },
    include: includeAll,
  });

  if (!resume) {
    resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fullName: `${user.username}`,
      },
      include: includeAll,
    });
  }

  return NextResponse.json(resume);
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    templateId, fullName, jobTitle, email, phone, location, website, summary,
    photoUrl, accentColor, interests,
    showSummary, showExperience, showEducation, showSkills,
    showLanguages, showCertifications, showAwards, showInterests,
    showOnPortfolio,
  } = body;

  const fields = {
    templateId: templateId ?? "classic",
    fullName: fullName ?? "",
    jobTitle: jobTitle ?? "",
    email: email ?? "",
    phone: phone ?? "",
    location: location ?? "",
    website: website ?? "",
    summary: summary ?? "",
    photoUrl: photoUrl ?? "",
    accentColor: accentColor ?? "",
    interests: interests ?? "",
    showSummary: showSummary ?? true,
    showExperience: showExperience ?? true,
    showEducation: showEducation ?? true,
    showSkills: showSkills ?? true,
    showLanguages: showLanguages ?? true,
    showCertifications: showCertifications ?? true,
    showAwards: showAwards ?? true,
    showInterests: showInterests ?? true,
    showOnPortfolio: showOnPortfolio ?? false,
  };

  const resume = await prisma.resume.upsert({
    where: { userId: user.id },
    update: fields,
    create: { userId: user.id, ...fields },
  });

  return NextResponse.json(resume);
}
