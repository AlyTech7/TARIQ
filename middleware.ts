import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/request";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
});

const isPublicRoute = createRouteMatcher([
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
  "/:locale/verificar/(.*)",
  "/api/webhooks/(.*)",
  "/api/cron/(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/:locale/admin(.*)",
  "/:locale/super-admin(.*)",
]);

const localeRootPattern = new RegExp(`^/(${locales.join("|")})$`);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;

  // APIs: pasar directo sin i18n ni redirects
  if (
    path.startsWith("/api/trpc") ||
    path.startsWith("/api/webhooks") ||
    path.startsWith("/api/cron") ||
    path.startsWith("/api/upload")
  ) {
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (
      req.nextUrl.pathname.includes("/super-admin") &&
      role !== "SUPER_ADMIN"
    ) {
      // Role check also done in layout — redirect handled there
    }
  }

  if (localeRootPattern.test(req.nextUrl.pathname)) {
    const locale = req.nextUrl.pathname.slice(1);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
