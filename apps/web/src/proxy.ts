// اكتشاف اللغة وتوجيهها + حماية صفحات (app) للمستخدمين المسجلين فقط
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { CALLBACK_PARAM, ONBOARDING_COOKIE, SESSION_COOKIE } from "@/lib/data/constants/app.constants";
import { guardRedirect } from "@/lib/utils/auth/route-guard";

const intl = createIntlMiddleware(routing);

const localePrefix = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(localePrefix);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const pathWithoutLocale = pathname.replace(localePrefix, "") || "/";

  const redirect = guardRedirect({
    path: pathWithoutLocale,
    search: request.nextUrl.search,
    hasSession: request.cookies.has(SESSION_COOKIE),
    needsOnboarding: request.cookies.has(ONBOARDING_COOKIE),
  });

  if (redirect) {
    const url = new URL(`/${locale}${redirect.to === "/" ? "" : redirect.to}`, request.url);
    if (redirect.callback) url.searchParams.set(CALLBACK_PARAM, redirect.callback);
    return NextResponse.redirect(url);
  }

  return intl(request);
}

// Next parses `matcher` statically at build time, so it can't be imported from middleware.config.ts
export const config = { matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"] };
