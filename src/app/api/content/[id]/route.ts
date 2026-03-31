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
  const { title, description, longDescription, tags, coverImage, coverImageDesc, image1, image1Desc, image2, image2Desc, image3, image3Desc, liveUrl, repoUrl, sectionId, contentType, videoUrl, videoDesc, codeContent, codeLanguage, modelUrl,
    cardBg,
    titleColor, titleFont, titleWeight,
    descColor, descFont, descWeight,
    tagBg, tagColor, tagFont, tagWeight,
    liveBtnBg, liveBtnColor, liveBtnFont, liveBtnWeight,
    repoBtnBg, repoBtnColor, repoBtnFont, repoBtnWeight,
  } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};

  // Regenerate slug when title changes
  if (title !== undefined) {
    data.title = title;
    let slug = title.toLowerCase().replace(/[^a-z0-9\u0400-\u04ff\u0530-\u058f]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) slug = "item";
    const existing = await prisma.contentItem.findFirst({ where: { userId, slug, NOT: { id: params.id } } });
    if (existing) {
      return NextResponse.json({ error: "An item with this name already exists. Please choose a different title." }, { status: 400 });
    }
    data.slug = slug;
  }

  if (description !== undefined) data.description = description;
  if (longDescription !== undefined) data.longDescription = longDescription;
  if (tags !== undefined) data.tags = tags;
  if (coverImage !== undefined) data.coverImage = coverImage;
  if (coverImageDesc !== undefined) data.coverImageDesc = coverImageDesc;
  if (image1 !== undefined) data.image1 = image1;
  if (image1Desc !== undefined) data.image1Desc = image1Desc;
  if (image2 !== undefined) data.image2 = image2;
  if (image2Desc !== undefined) data.image2Desc = image2Desc;
  if (image3 !== undefined) data.image3 = image3;
  if (image3Desc !== undefined) data.image3Desc = image3Desc;
  if (liveUrl !== undefined) data.liveUrl = liveUrl;
  if (repoUrl !== undefined) data.repoUrl = repoUrl;
  if (sectionId !== undefined) data.sectionId = sectionId;
  if (contentType !== undefined) data.contentType = contentType;
  if (videoUrl !== undefined) data.videoUrl = videoUrl;
  if (videoDesc !== undefined) data.videoDesc = videoDesc;
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
