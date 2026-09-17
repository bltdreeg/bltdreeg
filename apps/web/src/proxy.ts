// اكتشاف اللغة وتوجيهها + حماية صفحات (app) للمستخدمين المسجلين فقط
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { CALLBACK_PARAM, SESSION_COOKIE } from "@/lib/data/constants/app.constants";
import { ROUTE_LOGIN } from "@/lib/data/constants/routes.constants";
import { isProtectedPath } from "./middleware.config";

const intl = createIntlMiddleware(routing);

const localePrefix = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(localePrefix);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const pathWithoutLocale = pathname.replace(localePrefix, "") || "/";

  if (isProtectedPath(pathWithoutLocale) && !request.cookies.has(SESSION_COOKIE)) {
    const login = new URL(`/${locale}${ROUTE_LOGIN}`, request.url);
    login.searchParams.set(CALLBACK_PARAM, pathWithoutLocale);
    return NextResponse.redirect(login);
  }

  return intl(request);
}

// Next parses `matcher` statically at build time, so it can't be imported from middleware.config.ts
export const config = { matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"] };
