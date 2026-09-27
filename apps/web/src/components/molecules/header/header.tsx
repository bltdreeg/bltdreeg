"use client";

import { Menu } from "@base-ui/react/menu";
import {
  LogIn,
  Languages,
  Menu as MenuIcon,
  Smartphone,
  CircleHelp,
  ChevronUp,
  User,
  Calendar,
  Heart,
  LogOut,
  Store,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Avatar } from "@/components/atoms/avatar";
import { PageContainer } from "@/components/atoms/page-container";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { getAppName } from "@/lib/data/constants/app.constants";
import {
  ROUTE_ACCOUNT,
  ROUTE_ACCOUNT_HELP,
  ROUTE_ACCOUNT_PROFILE,
  ROUTE_APP_DOWNLOAD,
  ROUTE_BOOKINGS,
  ROUTE_FAVORITES,
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_PARTNER,
} from "@/lib/data/constants/routes.constants";
import { useUser } from "@/lib/hooks/user";
import { cn } from "@/lib/utils/cn.utils";

type HeaderProps = {
  userName?: string | null;
  isAuthenticated?: boolean;
};

const menuItemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-foreground transition-colors data-highlighted:bg-muted cursor-pointer";

export function Header({
  userName: propUserName,
  isAuthenticated: propIsAuthenticated,
}: HeaderProps) {
  const t = useTranslations("common.header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated: hookIsAuth, user: hookUser } = useUser();

  const nextLocale = locale === "ar" ? "en" : "ar";
  const nextLocaleName = nextLocale === "ar" ? "العربية" : "English";

  const isAuth =
    propIsAuthenticated !== undefined ? propIsAuthenticated : hookIsAuth;
  const activeUserName =
    propUserName !== undefined
      ? propUserName
      : isAuth
        ? hookUser?.name || "كريم"
        : null;

  return (
    <header className="sticky top-0 z-40 bg-primary">
      <PageContainer className="flex h-15 items-center justify-between gap-3 md:gap-6">
        {/* 1. الشعار والاسم — في بداية السطر (يمين في RTL) */}
        <Link
          href={ROUTE_HOME}
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-95"
        >
          {/* الماركة تيل زي لون الهيدر — فـ محطوطة على خلفية بيضا عشان تبان */}
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1">
            <Image
              src="/logo-mark.png"
              alt=""
              width={496}
              height={521}
              priority
              className="h-full w-auto object-contain"
            />
          </span>
          <span className="text-[19px] font-black tracking-tight text-primary-foreground">
            {getAppName(locale)}
          </span>
        </Link>

        {/* 2. عناصر التحكم في نهاية السطر (يسار في RTL) */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {/* تسجيل الدخول — للزائر فقط */}
          {!isAuth && (
            <Link
              href={ROUTE_LOGIN}
              className="hidden rounded-full px-3 py-1.5 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/15 sm:block"
            >
              {t("signIn")}
            </Link>
          )}

          {/* انضم كصالون — زر بحدود. بيودّي لصفحة الشراكة الأول، والتسجيل نفسه في لوحة الصالونات */}
          <Link
            href={ROUTE_PARTNER}
            className="hidden rounded-full border border-primary-foreground/35 px-4 py-1.5 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/15 sm:block"
          >
            {t("joinSalon")}
          </Link>

          {/* القائمة — الأڤاتار للمستخدم المسجل، زر القائمة للزائر */}
          <Menu.Root>
            {isAuth ? (
              <Menu.Trigger
                className="flex items-center gap-1.5 rounded-full border border-primary-foreground/35 p-1 ps-2.5 text-primary-foreground transition-colors hover:bg-primary-foreground/15 cursor-pointer"
                aria-label={t("myAccount", {
                  name: activeUserName || t("defaultUser"),
                })}
              >
                <ChevronUp
                  aria-hidden
                  className="size-4 transition-transform data-popup-open:rotate-180"
                />
                <Avatar
                  name={activeUserName || t("defaultUser")}
                  size={28}
                  className="border-0 bg-primary-foreground/20 text-xs font-bold text-primary-foreground"
                />
              </Menu.Trigger>
            ) : (
              <Menu.Trigger
                className="flex items-center gap-2 rounded-full border border-primary-foreground/35 px-3 py-1.5 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/15 cursor-pointer sm:px-4"
                aria-label={t("menu")}
              >
                <span className="hidden sm:block">{t("menu")}</span>
                <MenuIcon aria-hidden className="size-4" />
              </Menu.Trigger>
            )}
            <Menu.Portal>
              <Menu.Positioner sideOffset={8} align="end" className="z-50">
                <Menu.Popup className="min-w-56 rounded-2xl border border-border bg-background p-1.5 shadow-lg outline-none">
                  {isAuth ? (
                    <>
                      {/* اسم المستخدم */}
                      <p className="px-3 pt-1.5 pb-2.5 text-[15px] font-extrabold text-foreground">
                        {activeUserName}
                      </p>

                      <Menu.LinkItem
                        closeOnClick
                        className={menuItemClass}
                        render={<Link href={ROUTE_ACCOUNT_PROFILE} />}
                      >
                        <User
                          aria-hidden
                          className="size-4 text-muted-foreground"
                        />
                        {t("profile")}
                      </Menu.LinkItem>
                      <Menu.LinkItem
                        closeOnClick
                        className={menuItemClass}
                        render={<Link href={ROUTE_BOOKINGS} />}
                      >
                        <Calendar
                          aria-hidden
                          className="size-4 text-muted-foreground"
                        />
                        {t("myBookings")}
                      </Menu.LinkItem>
                      <Menu.LinkItem
                        closeOnClick
                        className={menuItemClass}
                        render={<Link href={ROUTE_FAVORITES} />}
                      >
                        <Heart
                          aria-hidden
                          className="size-4 text-muted-foreground"
                        />
                        {t("favorites")}
                      </Menu.LinkItem>
                      <Menu.LinkItem
                        closeOnClick
                        className={menuItemClass}
                        render={<Link href={ROUTE_ACCOUNT} />}
                      >
                        <LogOut
                          aria-hidden
                          className="size-4 text-muted-foreground"
                        />
                        {t("logout")}
                      </Menu.LinkItem>

                      <Menu.Separator className="my-1.5 h-px bg-border" />
                    </>
                  ) : (
                    /* تسجيل الدخول للزائر */
                    <Menu.LinkItem
                      closeOnClick
                      className={menuItemClass}
                      render={<Link href={ROUTE_LOGIN} />}
                    >
                      <LogIn
                        aria-hidden
                        className="size-4 text-muted-foreground"
                      />
                      {t("signIn")}
                    </Menu.LinkItem>
                  )}

                  {/* عناصر مشتركة بين الحالتين */}
                  <Menu.LinkItem
                    closeOnClick
                    className={menuItemClass}
                    render={<Link href={ROUTE_APP_DOWNLOAD} />}
                  >
                    <Smartphone
                      aria-hidden
                      className="size-4 text-muted-foreground"
                    />
                    {t("downloadApp")}
                  </Menu.LinkItem>
                  <Menu.LinkItem
                    closeOnClick
                    className={menuItemClass}
                    render={<Link href={ROUTE_ACCOUNT_HELP} />}
                  >
                    <CircleHelp
                      aria-hidden
                      className="size-4 text-muted-foreground"
                    />
                    {t("help")}
                  </Menu.LinkItem>
                  <Menu.Item
                    className={menuItemClass}
                    onClick={() =>
                      router.replace(pathname, { locale: nextLocale })
                    }
                  >
                    <Languages
                      aria-hidden
                      className="size-4 text-muted-foreground"
                    />
                    {t("switchLanguage", { language: nextLocaleName })}
                  </Menu.Item>
                  <Menu.LinkItem
                    closeOnClick
                    className={cn(menuItemClass, "sm:hidden")}
                    render={<Link href={ROUTE_PARTNER} />}
                  >
                    <Store aria-hidden className="size-4 text-muted-foreground" />
                    {t("joinSalon")}
                  </Menu.LinkItem>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </PageContainer>
    </header>
  );
}
