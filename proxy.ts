import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { getToken } from "next-auth/jwt";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth protection for dashboard routes
  const isDashboard = pathname.includes("/dashboard");
  const isBooking = pathname.includes("/book");
  const isApiAuth = pathname.startsWith("/api/auth");

  if (isDashboard || isBooking) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const segments = pathname.split("/").filter(Boolean);
      const localeFromPath = routing.locales.includes(
        segments[0] as (typeof routing.locales)[number]
      )
        ? segments[0]
        : routing.defaultLocale;
      const loginUrl = new URL(
        `/${localeFromPath}/auth/login`,
        request.url
      );
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isDashboard && token.role === "STUDENT") {
      const segments = pathname.split("/").filter(Boolean);
      const localeFromPath = routing.locales.includes(
        segments[0] as (typeof routing.locales)[number]
      )
        ? segments[0]
        : routing.defaultLocale;
      return NextResponse.redirect(
        new URL(`/${localeFromPath}`, request.url)
      );
    }
  }

  if (isApiAuth) return NextResponse.next();

  // Skip i18n middleware for all API routes
  if (pathname.startsWith("/api")) return NextResponse.next();

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/",
  ],
};
