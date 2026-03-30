import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
          isPaid: user.isPaid,
          isFreeAccess: user.isFreeAccess,
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
        // New Google user — allow sign-in, profile completion happens next
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
          token.isPaid = dbUser.isPaid;
          token.isFreeAccess = dbUser.isFreeAccess;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.needsSetup = false;
        } else {
          // New Google user — no DB record yet, needs profile completion
          token.email = user.email;
          token.googleName = user.name || "";
          token.needsSetup = true;
        }
      } else if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.isAdmin = user.isAdmin;
        token.isPaid = user.isPaid;
        token.isFreeAccess = user.isFreeAccess;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }

      // Always re-fetch isPaid/isFreeAccess from DB so admin revoke takes effect immediately
      if (!user && !account && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isPaid: true, isFreeAccess: true },
        });
        if (freshUser) {
          token.isPaid = freshUser.isPaid;
          token.isFreeAccess = freshUser.isFreeAccess;
        }
      }

      // Re-fetch full user data from DB on session update trigger (e.g. after username change or profile completion)
      if (trigger === "update") {
        const dbUser = token.id
          ? await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { id: true, username: true, firstName: true, lastName: true, email: true, isPaid: true, isFreeAccess: true },
            })
          : token.email
            ? await prisma.user.findUnique({
                where: { email: token.email as string },
                select: { id: true, username: true, firstName: true, lastName: true, email: true, isPaid: true, isFreeAccess: true },
              })
            : null;
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.email = dbUser.email;
          token.isAdmin = dbUser.username === "admin";
          token.isPaid = dbUser.isPaid;
          token.isFreeAccess = dbUser.isFreeAccess;
          token.needsSetup = false;
          token.googleName = undefined;
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
        isPaid: token.isPaid,
        isFreeAccess: token.isFreeAccess,
        firstName: token.firstName,
        lastName: token.lastName,
        needsSetup: token.needsSetup,
        googleName: token.googleName,
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
