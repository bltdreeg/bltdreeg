// قائمة حسابي: الحساب / التطبيق / المساعدة — شبكة من 3 كروت مطابقة للتصميم
"use client";

import {
  User,
  Heart,
  Calendar,
  Globe,
  Bell,
  Sliders,
  HelpCircle,
  FileText,
  Info,
  ChevronLeft,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/atoms/sheet";
import {
  ROUTE_BOOKINGS,
  ROUTE_FAVORITES,
  ROUTE_ACCOUNT_PROFILE,
  ROUTE_ACCOUNT_LANGUAGE,
  ROUTE_ACCOUNT_HELP,
} from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

type AccountMenuProps = {
  favoriteCount?: number;
  upcomingBookingsCount?: number;
};

export function AccountMenu({
  favoriteCount = 4,
  upcomingBookingsCount = 2,
}: AccountMenuProps) {
  const t = useTranslations("app.account.menu");
  const locale = useLocale();

  const COMING_SOON = (
    <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
  );

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      {/* 1 — الحساب */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-[18px] py-[14px]">
          <h3 className="text-[13px] font-bold text-muted-foreground">{t("accountSection")}</h3>
        </div>

        <div className="divide-y divide-border/60">
          {/* الملف الشخصي */}
          <Link
            href={ROUTE_ACCOUNT_PROFILE}
            className="flex items-center gap-3.5 px-[18px] py-4 transition-colors hover:bg-muted/40 cursor-pointer"
          >
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
              <User className="size-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-[14.5px] font-semibold text-foreground">
              {t("profile")}
            </span>
            <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          </Link>

          {/* الصالونات المفضلة */}
          <Link
            href={ROUTE_FAVORITES}
            className="flex items-center gap-3.5 px-[18px] py-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
              <Heart className="size-4 text-primary" />
            </div>
            <div className="flex flex-1 items-center gap-2.5">
              <span className="text-[14.5px] font-semibold text-foreground">
                {t("favorites")}
              </span>
              <span className="flex h-5.5 items-center justify-center rounded-md border border-tint-border bg-tint px-2 text-[11.5px] font-bold text-primary-pressed">
                {favoriteCount}
              </span>
            </div>
            <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          </Link>

          {/* حجوزاتي */}
          <Link
            href={ROUTE_BOOKINGS}
            className="flex items-center gap-3.5 px-[18px] py-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
              <Calendar className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-1 items-center gap-2.5">
              <span className="text-[14.5px] font-semibold text-foreground">
                {t("bookings")}
              </span>
              <span className="text-[12.5px] text-muted-foreground">
                {t("upcomingCount", { count: upcomingBookingsCount })}
              </span>
            </div>
            <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </div>

      {/* 2 — التطبيق */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-[18px] py-[14px]">
          <h3 className="text-[13px] font-bold text-muted-foreground">{t("appSection")}</h3>
        </div>

        <div className="divide-y divide-border/60">
          {/* لغة التطبيق */}
          <Link
            href={ROUTE_ACCOUNT_LANGUAGE}
            className="flex items-center gap-3.5 px-[18px] py-4 transition-colors hover:bg-muted/40 cursor-pointer"
          >
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
              <Globe className="size-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-[14.5px] font-semibold text-foreground">
              {t("language")}
            </span>
            <span className="text-[13.5px] font-semibold text-muted-foreground">
              {locale === "ar" ? "العربية" : "English"}
            </span>
            <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          </Link>

          {/* الإشعارات */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <Bell className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[14.5px] font-semibold text-foreground">
                  {t("notifications")}
                </span>
                <span className="text-[12.5px] text-muted-foreground">
                  {t("notificationsSubtitle")}
                </span>
              </div>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title={t("notifications")}>{COMING_SOON}</SheetContent>
          </Sheet>

          {/* الإعدادات */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <Sliders className="size-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-[14.5px] font-semibold text-foreground">
                {t("settings")}
              </span>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title={t("settings")}>{COMING_SOON}</SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 3 — المساعدة */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-[18px] py-[14px]">
          <h3 className="text-[13px] font-bold text-muted-foreground">
            {t("helpSection")}
          </h3>
        </div>

        <div className="divide-y divide-border/60">
          {/* الدعم والمساعدة */}
          <Link
            href={ROUTE_ACCOUNT_HELP}
            className="flex items-center gap-3.5 px-[18px] py-4 transition-colors hover:bg-muted/40 cursor-pointer"
          >
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
              <HelpCircle className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[14.5px] font-semibold text-foreground">
                {t("helpAndSupport")}
              </span>
              <span className="text-[12.5px] text-muted-foreground">
                {t("helpSubtitle")}
              </span>
            </div>
            <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          </Link>

          {/* الشروط والخصوصية */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-[14.5px] font-semibold text-foreground">
                {t("termsAndPrivacy")}
              </span>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title={t("termsAndPrivacy")}>{COMING_SOON}</SheetContent>
          </Sheet>

          {/* عن بالتدريج */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <Info className="size-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-[14.5px] font-semibold text-foreground">
                {t("about")}
              </span>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title={t("about")}>{COMING_SOON}</SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
