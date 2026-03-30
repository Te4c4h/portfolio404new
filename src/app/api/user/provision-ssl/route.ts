import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { domain } = await req.json();
  if (!domain) return NextResponse.json({ error: "Domain required" }, { status: 400 });

  const clean = domain.trim().toLowerCase();

  // Verify this domain belongs to the requesting user
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { customDomain: true },
  });

  if (!dbUser || (dbUser as Record<string, unknown>).customDomain !== clean) {
    return NextResponse.json({ error: "Domain does not match your account" }, { status: 403 });
  }

  try {
    const scriptPath = "/home/server_local_arm/apps/portfolio404/provision-ssl.sh";
    const { stdout, stderr } = await execAsync(
      `echo MHA1989Hovo | sudo -S bash ${scriptPath} ${clean} 2>&1`,
      { timeout: 120000 }
    );

    const output = stdout + stderr;
    const success = output.includes("Nginx configured and reloaded") || output.includes("SSL certificate issued");

    return NextResponse.json({
      success,
      message: success ? "SSL certificate issued and configured" : "SSL provisioning may have encountered an issue",
      details: output.slice(-500),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("SSL provision error:", msg);
    return NextResponse.json({
      success: false,
      message: "Failed to provision SSL certificate",
      error: msg,
    }, { status: 500 });
  }
}
