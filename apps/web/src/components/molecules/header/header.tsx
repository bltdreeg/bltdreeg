"use client";

import { Search, MapPin, ChevronDown, LogIn, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Avatar } from "@/components/atoms/avatar";
import { PageContainer } from "@/components/atoms/page-container";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { getAppName } from "@/lib/data/constants/app.constants";
import {
  EXTERNAL_SALON_REGISTER,
  ROUTE_ACCOUNT,
  ROUTE_BOOKINGS,
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_SEARCH,
} from "@/lib/data/constants/routes.constants";
import { useUser } from "@/lib/hooks/user";
import { cn } from "@/lib/utils/cn.utils";

type HeaderProps = {
  areaName?: string;
  userName?: string | null;
  isAuthenticated?: boolean;
  /** شريط البحث بيتخفي في مسار الحجز */
  showSearchRow?: boolean;
};

export function Header({
  areaName = "المعادي",
  userName: propUserName,
  isAuthenticated: propIsAuthenticated,
  showSearchRow = true,
}: HeaderProps) {
  const t = useTranslations("common.header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated: hookIsAuth, user: hookUser } = useUser();

  const nextLocale = locale === "ar" ? "en" : "ar";
  const nextLocaleName = nextLocale === "ar" ? "العربية" : "English";

  const isAuth = propIsAuthenticated !== undefined ? propIsAuthenticated : hookIsAuth;
  const activeUserName =
    propUserName !== undefined
      ? propUserName
      : isAuth
        ? hookUser?.name || "كريم"
        : null;

  const firstName = activeUserName ? activeUserName.split(" ")[0] : "";

  return (
    <header className="sticky top-0 z-40 bg-primary">
      <PageContainer className="flex h-15 items-center justify-between gap-3 md:gap-6">
        {/* 1. الشعار واختيار المنطقة */}
        <div className="flex min-w-0 items-center gap-3 md:gap-5.5">
          <Link
            href={ROUTE_HOME}
            className="shrink-0 text-[19px] font-black tracking-tight text-primary-foreground transition-opacity hover:opacity-95"
          >
            {getAppName(locale)}
          </Link>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-foreground/15 px-2.5 py-1.5 transition-colors hover:bg-primary-foreground/25 cursor-pointer"
          >
            <MapPin aria-hidden className="size-3.5 text-primary-foreground" />
            <span className="text-[13px] font-bold text-primary-foreground">{areaName}</span>
            <ChevronDown aria-hidden className="size-3.5 text-primary-foreground" />
            <span className="sr-only">{t("changeArea")}</span>
          </button>
        </div>

        {/* 2. شريط البحث في منتصف الهيدر */}
        {showSearchRow && (
          <>
            {/* زر البحث للموبايل */}
            <Link
              href={ROUTE_SEARCH}
              aria-label={t("searchPlaceholder")}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 text-primary-foreground/90 sm:hidden",
                "transition-colors duration-200 hover:bg-primary-foreground/25",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-foreground/30",
              )}
            >
              <Search aria-hidden className="size-4" />
            </Link>

            {/* شريط البحث الموسع للشاشات الكبيرة */}
            <Link
              href={ROUTE_SEARCH}
              className={cn(
                "group hidden h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-primary-foreground/15 px-3.5 sm:flex md:max-w-[480px]",
                "transition-colors duration-200 ease-out hover:bg-primary-foreground/25",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-foreground/30",
              )}
            >
              <Search aria-hidden className="size-4 shrink-0 text-primary-foreground/80" />
              <span className="truncate text-sm text-primary-foreground/80">
                {t("searchPlaceholder")}
              </span>
            </Link>
          </>
        )}

        {/* 3. عناصر التحكم اليسرى حسب حالة المصادقة */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3 md:gap-4">
          {/* زر تبديل اللغة */}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: nextLocale })}
            aria-label={t("switchLanguage", { language: nextLocaleName })}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 text-primary-foreground transition-colors hover:bg-primary-foreground/25 cursor-pointer"
          >
            <Languages aria-hidden className="size-4" />
          </button>

          {/* رابط الانضمام كصالون (للكل على الشاشات الكبيرة) */}
          <a
            href={EXTERNAL_SALON_REGISTER}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg border border-primary-foreground/35 px-3 py-1.5 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/15 md:block"
          >
            {t("joinSalon")}
          </a>

          {isAuth ? (
            /* ================= حالة المستخدم المسجل (Authenticated) ================= */
            <>
              {/* رابط حجوزاتي */}
              <Link
                href={ROUTE_BOOKINGS}
                className="hidden text-[13px] font-semibold text-primary-foreground/90 transition-colors hover:text-primary-foreground sm:block"
              >
                {t("myBookings")}
              </Link>

              {/* زر البروفايل والحساب */}
              <Link
                href={ROUTE_ACCOUNT}
                className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-primary-foreground/15"
                aria-label={t("myAccount", { name: activeUserName || t("defaultUser") })}
              >
                <Avatar
                  name={activeUserName || "كريم"}
                  size={28}
                  className="border-0 bg-primary-foreground/20 text-xs font-bold text-primary-foreground"
                />
                {firstName && (
                  <span className="hidden text-[13px] font-semibold text-primary-foreground sm:block">
                    {firstName}
                  </span>
                )}
              </Link>
            </>
          ) : (
            /* ================= حالة الزائر غير المسجل (Unauthenticated) ================= */
            /* زر تسجيل الدخول البارز (موبايل وكمبيوتر) */
            <Link
              href={ROUTE_LOGIN}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 sm:px-3.5 py-1.5 text-xs sm:text-[13px] font-bold text-primary shadow-xs transition-colors hover:bg-white/90"
            >
              <LogIn className="size-3.5 sm:size-4" />
              <span>{t("signIn")}</span>
            </Link>
          )}
        </div>
      </PageContainer>
    </header>
  );
}
