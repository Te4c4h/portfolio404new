import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const MAIN_DOMAINS = ["portfolio404.site", "localhost", "127.0.0.1"];

function isMainDomain(host: string): boolean {
  const h = host.split(":")[0]; // strip port
  return MAIN_DOMAINS.some((d) => h === d || h === `www.${d}`);
}

export async function middleware(req: NextRequest) {
  // Force www → non-www redirect to prevent OAuth domain mismatch
  const host = req.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = req.nextUrl.clone();
    url.host = host.replace("www.", "");
    return NextResponse.redirect(url, 301);
  }

  // Custom domain handling — rewrite to /u/[username]
  if (!isMainDomain(host)) {
    const hostname = host.split(":")[0];
    const { pathname } = req.nextUrl;

    // Let API routes, static assets, and auth through as-is
    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/uploads/") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    // Look up the username for this custom domain
    // Use internal URL to avoid SSL loop — Next.js runs on port 3000
    const internalBase = "http://127.0.0.1:3000";
    try {
      const lookupRes = await fetch(
        `${internalBase}/api/domain-lookup?domain=${encodeURIComponent(hostname)}`,
        { headers: { "x-middleware-internal": "1" } }
      );
      const data = await lookupRes.json();

      if (data.username) {
        // Rewrite the request to the portfolio page
        const url = req.nextUrl.clone();
        // If path already starts with /u/{username}, use it as-is (e.g. item detail links)
        if (pathname.startsWith(`/u/${data.username}`)) {
          url.pathname = pathname;
        } else {
          url.pathname = `/u/${data.username}${pathname === "/" ? "" : pathname}`;
        }
        return NextResponse.rewrite(url);
      }
    } catch (e) {
      console.error("Custom domain lookup failed:", e);
    }

    // Domain not found — show 404
    const url = req.nextUrl.clone();
    url.pathname = "/not-found";
    return NextResponse.rewrite(url);
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public auth pages — allow through
  if (pathname === "/verify-email" || pathname === "/reset-password") {
    return NextResponse.next();
  }

  // Allow /complete-signup only for users who need setup
  if (pathname === "/complete-signup") {
    if (token?.needsSetup) return NextResponse.next();
    if (token?.username) return NextResponse.redirect(new URL(`/u/${token.username}/admin`, req.url));
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // New Google user who needs profile completion — redirect to /complete-signup
  // Skip API routes so the complete-signup form submission works
  if (token?.needsSetup && pathname !== "/complete-signup" && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/complete-signup", req.url));
  }

  // Authenticated user visits /login → redirect to their dashboard
  if (pathname === "/login") {
    if (token && token.username) {
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|api/auth).*)"],
};
