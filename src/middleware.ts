import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Public routes - no auth required
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/jobs") ||
    pathname.startsWith("/api/applications") && request.method === "POST" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // /hr/* requires HR or ADMIN
  if (pathname.startsWith("/hr")) {
    if (!["HR", "ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // /manager/* requires MANAGER or ADMIN
  if (pathname.startsWith("/manager")) {
    if (!["MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // /admin/* requires ADMIN
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // /my-applications and /profile require APPLICANT
  if (
    pathname.startsWith("/my-applications") ||
    pathname.startsWith("/profile")
  ) {
    if (role !== "APPLICANT") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
