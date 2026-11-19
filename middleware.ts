import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

// Runs before /admin's own page code, so an unauthenticated browser never
// receives the console's HTML/JS at all — this is a real content boundary,
// not just a client-side UI gate that happens to hide a button.
// The login/logout routes must stay reachable without a session — they're
// what ISSUES and CLEARS the cookie this middleware checks.
const AUTH_ROUTE_EXCEPTIONS = ["/api/admin/login", "/api/admin/logout"];

export async function middleware(request: NextRequest) {
  if (AUTH_ROUTE_EXCEPTIONS.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authorized = await verifyAdminSessionToken(token);
  if (authorized) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { error: "Admin authorization required." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin-login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.rewrite(loginUrl);
}
