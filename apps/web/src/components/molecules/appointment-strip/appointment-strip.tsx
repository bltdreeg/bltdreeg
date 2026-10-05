import { useLocale, useTranslations } from "next-intl";
import { PageContainer } from "@/components/atoms/page-container";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKING_DETAILS } from "@/lib/data/constants/routes.constants";
import { getAppName } from "@/lib/data/constants/app.constants";
import { cn } from "@/lib/utils/cn.utils";

type AppointmentStripProps = {
  time?: string;
  queueNumber?: number;
  statusText?: string;
  bookingId?: string;
  className?: string;
};

export function AppointmentStrip({
  time = "6:30 م",
  queueNumber = 3,
  statusText,
  bookingId,
  className,
}: AppointmentStripProps) {
  const t = useTranslations("common.appointmentStrip");
  const locale = useLocale();
  const displayStatus = statusText ?? t("onSchedule");

  const content = (
    <div
      className={cn(
        "flex min-h-[54px] w-full items-center justify-between gap-4 bg-primary py-2.5 text-primary-foreground",
        className
      )}
    >
      <PageContainer className="flex w-full flex-wrap items-center justify-between gap-3">
        {/* معلومات الميعاد والدور */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <span className="text-[17px] font-black tracking-tight text-white">
            {getAppName(locale)}
          </span>

          <div
            aria-hidden
            className="hidden h-6.5 w-px bg-white/25 sm:block"
          />

          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-white/90">
              {t("yourAppointmentToday")}
            </span>
            <span className="tabular text-[17px] font-extrabold text-white">
              {time}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-white/90">
              {t("queueNumber")}
            </span>
            <span className="tabular text-[17px] font-extrabold text-white">
              {queueNumber}
            </span>
          </div>
        </div>

        {/* حالة الصالون: الصالون في ميعاده */}
        <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[#DCFCE7] px-2.5 py-1.5 text-[#15803D]">
          <span className="size-1.5 shrink-0 rounded-full bg-[#15803D]" />
          <span className="text-xs font-bold">{displayStatus}</span>
        </div>
      </PageContainer>
    </div>
  );

  if (bookingId) {
    return (
      <Link
        href={ROUTE_BOOKING_DETAILS(bookingId)}
        aria-label={t("trackingAria")}
        className="block transition-opacity hover:opacity-95 focus-visible:outline-none"
      >
        {content}
      </Link>
    );
  }

  return content;
}

