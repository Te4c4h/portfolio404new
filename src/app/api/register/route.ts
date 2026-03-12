import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, username, password } = body;

    if (!firstName || !lastName || !email || !username || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "Username must be between 3 and 20 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email is already taken" },
        { status: 409 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          username,
          password: hashedPassword,
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
          loadingHeading: `${firstName} ${lastName}`,
          loadingSubtitle: "Portfolio",
          footerText: `© 2026 ${firstName} ${lastName}`,
        },
      });

      await tx.theme.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
