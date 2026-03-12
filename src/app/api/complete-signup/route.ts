import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, username } = await req.json();

    if (!email || !firstName || !lastName || !username) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: "Username must be 3–20 characters" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    // Check if email already exists (shouldn't, but safety check)
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          username,
          password: "", // Google OAuth user — no password
          emailVerified: true, // Google-verified email
        },
      });

      await tx.siteContent.create({
        data: {
          userId: newUser.id,
          siteTitle: `${firstName}'s Portfolio`,
          logoText: firstName,
          headline: `Hello, I'm ${firstName}`,
          subtext: "Welcome to my portfolio",
          ctaLabel1: "View Work",
          ctaLabel2: "Contact Me",
          contactTitle: "Get In Touch",
          contactSubtitle: "Feel free to reach out",
          footerText: `© 2026 ${firstName} ${lastName}`,
        },
      });

      await tx.theme.create({
        data: { userId: newUser.id },
      });

      return newUser;
    });

    return NextResponse.json(
      { user: { id: user.id, username: user.username, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complete signup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
