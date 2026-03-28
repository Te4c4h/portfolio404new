import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (user.isBlocked) {
          throw new Error("Your account has been blocked");
        }

        if (!user.emailVerified) {
          throw new Error("UNVERIFIED");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        const isAdmin = user.username === "admin";

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          if (existing.isBlocked) return false;
          // Mark as verified if not already
          if (!existing.emailVerified) {
            await prisma.user.update({ where: { email }, data: { emailVerified: true } });
          }
          return true;
        }

        // New Google user — create account directly
        const name = user.name || "";
        const nameParts = name.split(" ");
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Generate unique username from email prefix
        const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 15) || "user";
        let username = baseUsername;
        let suffix = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${suffix}`;
          suffix++;
        }

        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              firstName,
              lastName,
              email,
              username,
              password: "",
              emailVerified: true,
              isPublished: true,
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
              footerText: `© ${new Date().getFullYear()} ${firstName} ${lastName}`,
            },
          });

          await tx.theme.create({
            data: { userId: newUser.id },
          });
        });

        // Send welcome email (non-blocking)
        sendWelcomeEmail(email, firstName, username).catch(console.error);

        return true;
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.email = dbUser.email;
          token.isAdmin = dbUser.username === "admin";
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
        }
      } else if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }

      // Re-fetch user data from DB on session update trigger (e.g. after username change)
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { username: true, firstName: true, lastName: true, email: true },
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.email = dbUser.email;
          token.isAdmin = dbUser.username === "admin";
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email,
        isAdmin: token.isAdmin,
        firstName: token.firstName,
        lastName: token.lastName,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
