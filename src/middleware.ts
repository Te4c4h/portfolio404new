import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Force www → non-www redirect to prevent OAuth domain mismatch
  const host = req.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = req.nextUrl.clone();
    url.host = host.replace("www.", "");
    return NextResponse.redirect(url, 301);
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public auth pages — allow through
  if (pathname === "/verify-email" || pathname === "/reset-password" || pathname === "/complete-signup") {
    return NextResponse.next();
  }

  // Authenticated user visits /login → redirect to their dashboard
  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(
        new URL(`/u/${token.username}/admin`, req.url)
      );
    }
    return NextResponse.next();
  }

  // Protected: /admin route — admin-only dashboard
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!token.isAdmin) {
      return NextResponse.redirect(
        new URL(`/u/${token.username}/admin`, req.url)
      );
    }
    return NextResponse.next();
  }

  // Protected: /u/[username]/admin routes
  const userAdminMatch = pathname.match(/^\/u\/([^/]+)\/admin/);
  if (userAdminMatch) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const routeUsername = userAdminMatch[1];
    // User visits another user's dashboard → redirect to their own
    if (routeUsername !== token.username && !token.isAdmin) {
      return NextResponse.redirect(
        new URL(`/u/${token.username}/admin`, req.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/).*)"],
};
