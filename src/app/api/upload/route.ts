import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create folder if it doesn't exist
    const uploadPath = path.join(UPLOAD_DIR, folder);
    await mkdir(uploadPath, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name).toLowerCase();
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadPath, filename);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Return URL path (served by Next.js from /public or by Nginx)
    const baseUrl = process.env.NEXTAUTH_URL || "";
    const url = `${baseUrl}/uploads/${folder}/${filename}`;

    return NextResponse.json({ secure_url: url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
