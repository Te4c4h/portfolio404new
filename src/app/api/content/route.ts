import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserId } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sectionId = req.nextUrl.searchParams.get("sectionId");

  const where: { userId: string; sectionId?: string } = { userId };
  if (sectionId) where.sectionId = sectionId;

  const items = await prisma.contentItem.findMany({
    where,
    orderBy: { order: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, longDescription, sectionId, tags, coverImage, coverImageDesc, image1, image1Desc, image2, image2Desc, image3, image3Desc, liveUrl, repoUrl, contentType, videoUrl, videoDesc, video1Url, video1Desc, video2Url, video2Desc, video3Url, video3Desc, codeContent, codeLanguage, modelUrl,
    cardBg,
    titleColor, titleFont, titleWeight,
    descColor, descFont, descWeight,
    tagBg, tagColor, tagFont, tagWeight,
    liveBtnText, liveBtnBg, liveBtnColor, liveBtnFont, liveBtnWeight,
    repoBtnText, repoBtnBg, repoBtnColor, repoBtnFont, repoBtnWeight,
    longDescColor, longDescFont, longDescWeight,
    imgDescColor, imgDescFont, imgDescWeight,
  } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (!sectionId) return NextResponse.json({ error: "Section is required" }, { status: 400 });

  // Generate slug from title
  let slug = title.toLowerCase().replace(/[^a-z0-9\u0400-\u04ff\u0530-\u058f]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) slug = "item";
  // Ensure slug is unique for this user
  const existing = await prisma.contentItem.findFirst({ where: { userId, slug } });
  if (existing) {
    return NextResponse.json({ error: "An item with this name already exists. Please choose a different title." }, { status: 400 });
  }

  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section || section.userId !== userId) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }

  const maxOrder = await prisma.contentItem.findFirst({
    where: { sectionId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const data = {
    userId,
    sectionId,
    slug,
    contentType: contentType || "project",
    title,
    description: description || "",
    longDescription: longDescription || "",
    tags: tags || "",
    coverImage: coverImage || "",
    coverImageDesc: coverImageDesc || "",
    image1: image1 || "",
    image1Desc: image1Desc || "",
    image2: image2 || "",
    image2Desc: image2Desc || "",
    image3: image3 || "",
    image3Desc: image3Desc || "",
    liveUrl: liveUrl || "",
    repoUrl: repoUrl || "",
    videoUrl: videoUrl || "",
    videoDesc: videoDesc || "",
    video1Url: video1Url || "",
    video1Desc: video1Desc || "",
    video2Url: video2Url || "",
    video2Desc: video2Desc || "",
    video3Url: video3Url || "",
    video3Desc: video3Desc || "",
    codeContent: codeContent || "",
    codeLanguage: codeLanguage || "",
    modelUrl: modelUrl || "",
    order: (maxOrder?.order ?? -1) + 1,
    ...(cardBg !== undefined && { cardBg }),
    ...(titleColor !== undefined && { titleColor }),
    ...(titleFont !== undefined && { titleFont }),
    ...(titleWeight !== undefined && { titleWeight }),
    ...(descColor !== undefined && { descColor }),
    ...(descFont !== undefined && { descFont }),
    ...(descWeight !== undefined && { descWeight }),
    ...(tagBg !== undefined && { tagBg }),
    ...(tagColor !== undefined && { tagColor }),
    ...(tagFont !== undefined && { tagFont }),
    ...(tagWeight !== undefined && { tagWeight }),
    ...(liveBtnText !== undefined && { liveBtnText }),
    ...(liveBtnBg !== undefined && { liveBtnBg }),
    ...(liveBtnColor !== undefined && { liveBtnColor }),
    ...(liveBtnFont !== undefined && { liveBtnFont }),
    ...(liveBtnWeight !== undefined && { liveBtnWeight }),
    ...(repoBtnText !== undefined && { repoBtnText }),
    ...(repoBtnBg !== undefined && { repoBtnBg }),
    ...(repoBtnColor !== undefined && { repoBtnColor }),
    ...(repoBtnFont !== undefined && { repoBtnFont }),
    ...(repoBtnWeight !== undefined && { repoBtnWeight }),
    ...(longDescColor !== undefined && { longDescColor }),
    ...(longDescFont !== undefined && { longDescFont }),
    ...(longDescWeight !== undefined && { longDescWeight }),
    ...(imgDescColor !== undefined && { imgDescColor }),
    ...(imgDescFont !== undefined && { imgDescFont }),
    ...(imgDescWeight !== undefined && { imgDescWeight }),
  };

  const item = await prisma.contentItem.create({ data: data as Parameters<typeof prisma.contentItem.create>[0]["data"] });

  return NextResponse.json(item, { status: 201 });
}
