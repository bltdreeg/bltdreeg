"use client";

// إطار خطوات الحجز: هيدر أخضر بعرض كامل + شريط خطوات متقدم + عمودين للمحتوى مطابق لتصميم FRAME 07
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { User } from "lucide-react";
import { Avatar } from "@/components/atoms/avatar";
import { PageContainer } from "@/components/atoms/page-container";
import { Link } from "@/i18n/navigation";
import { getAppName } from "@/lib/data/constants/app.constants";
import { ROUTE_ACCOUNT, ROUTE_HOME, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { BookingStepper } from "../booking-stepper";

type BookingShellProps = {
  salonId: string;
  salonName?: string;
  userName?: string;
  step: 1 | 2 | 3 | 4;
  title?: string;
  subtitle?: string;
  panel: ReactNode;
  children: ReactNode;
  serviceSummary?: string;
  barberSummary?: string;
  slotSummary?: string;
};

export function BookingShell({
  salonId,
  salonName,
  userName,
  step,
  title,
  subtitle,
  panel,
  children,
  serviceSummary,
  barberSummary,
  slotSummary,
}: BookingShellProps) {
  const t = useTranslations("app.book.shell");
  const locale = useLocale();
  const resolvedSalonName = salonName ?? salonDetailsById(salonId)?.name ?? t("fallbackSalon");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      {/* الشريط العلوي الأخضر (FRAME 07) */}
      <header className="h-[46px] w-full bg-primary text-white">
        <PageContainer className="flex h-full items-center justify-between">
          <div className="flex min-w-0 items-center gap-2 sm:gap-5">
            <Link
              href={ROUTE_HOME}
              className="shrink-0 text-[17px] font-black leading-none tracking-tight text-white hover:opacity-95 sm:text-[19px]"
            >
              {getAppName(locale)}
            </Link>
            <span className="max-w-[85px] truncate text-xs font-semibold text-white/90 sm:max-w-none sm:text-[13px]">
              {resolvedSalonName}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
            <Link
              href={ROUTE_SALON(salonId)}
              className="shrink-0 text-xs font-semibold text-white/90 transition-opacity hover:text-white sm:text-[13px]"
            >
              {t("exitBooking")}
            </Link>
            <Link
              href={ROUTE_ACCOUNT}
              title={t("profileAria")}
              aria-label={t("profileAria")}
              className="flex size-[26px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            >
              {userName ? (
                <Avatar name={userName} size={26} className="border-0 bg-transparent text-white" />
              ) : (
                <User className="size-3.5 text-white" />
              )}
            </Link>
          </div>
        </PageContainer>
      </header>

      {/* شريط الستبر */}
      <div className="w-full border-b border-border bg-white py-5">
        <PageContainer>
          <BookingStepper
            step={step}
            serviceSummary={serviceSummary}
            barberSummary={barberSummary}
            slotSummary={slotSummary}
          />
        </PageContainer>
      </div>

      {/* محتوى الصفحة واللوحة الجانبية */}
      <PageContainer className="flex flex-col items-stretch gap-6 pt-6 pb-28 lg:pt-12 lg:pb-16 lg:flex-row lg:items-start lg:gap-10">
        {panel && (
          <aside className="w-full shrink-0 order-last lg:order-first lg:w-[380px]">
            {panel}
          </aside>
        )}
        <div className="w-full min-w-0 flex-1">
          {title && (
            <div className="mb-6 flex flex-col gap-1.5">
              <h1 className="text-2xl font-extrabold text-foreground sm:text-[28px] leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </PageContainer>
    </div>
  );
}
