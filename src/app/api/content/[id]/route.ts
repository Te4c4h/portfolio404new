import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectiveUserId } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.contentItem.findUnique({ where: { id: params.id } });
  if (!item || item.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, tags, coverImage, image1, image2, image3, liveUrl, repoUrl, sectionId, contentType, videoUrl, codeContent, codeLanguage, modelUrl,
    cardBg,
    titleColor, titleFont, titleWeight,
    descColor, descFont, descWeight,
    tagBg, tagColor, tagFont, tagWeight,
    liveBtnBg, liveBtnColor, liveBtnFont, liveBtnWeight,
    repoBtnBg, repoBtnColor, repoBtnFont, repoBtnWeight,
  } = body;

  const data: Record<string, string> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (tags !== undefined) data.tags = tags;
  if (coverImage !== undefined) data.coverImage = coverImage;
  if (image1 !== undefined) data.image1 = image1;
  if (image2 !== undefined) data.image2 = image2;
  if (image3 !== undefined) data.image3 = image3;
  if (liveUrl !== undefined) data.liveUrl = liveUrl;
  if (repoUrl !== undefined) data.repoUrl = repoUrl;
  if (sectionId !== undefined) data.sectionId = sectionId;
  if (contentType !== undefined) data.contentType = contentType;
  if (videoUrl !== undefined) data.videoUrl = videoUrl;
  if (codeContent !== undefined) data.codeContent = codeContent;
  if (codeLanguage !== undefined) data.codeLanguage = codeLanguage;
  if (modelUrl !== undefined) data.modelUrl = modelUrl;
  if (cardBg !== undefined) data.cardBg = cardBg;
  if (titleColor !== undefined) data.titleColor = titleColor;
  if (titleFont !== undefined) data.titleFont = titleFont;
  if (titleWeight !== undefined) data.titleWeight = titleWeight;
  if (descColor !== undefined) data.descColor = descColor;
  if (descFont !== undefined) data.descFont = descFont;
  if (descWeight !== undefined) data.descWeight = descWeight;
  if (tagBg !== undefined) data.tagBg = tagBg;
  if (tagColor !== undefined) data.tagColor = tagColor;
  if (tagFont !== undefined) data.tagFont = tagFont;
  if (tagWeight !== undefined) data.tagWeight = tagWeight;
  if (liveBtnBg !== undefined) data.liveBtnBg = liveBtnBg;
  if (liveBtnColor !== undefined) data.liveBtnColor = liveBtnColor;
  if (liveBtnFont !== undefined) data.liveBtnFont = liveBtnFont;
  if (liveBtnWeight !== undefined) data.liveBtnWeight = liveBtnWeight;
  if (repoBtnBg !== undefined) data.repoBtnBg = repoBtnBg;
  if (repoBtnColor !== undefined) data.repoBtnColor = repoBtnColor;
  if (repoBtnFont !== undefined) data.repoBtnFont = repoBtnFont;
  if (repoBtnWeight !== undefined) data.repoBtnWeight = repoBtnWeight;

  const updated = await prisma.contentItem.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getEffectiveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.contentItem.findUnique({ where: { id: params.id } });
  if (!item || item.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.contentItem.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
