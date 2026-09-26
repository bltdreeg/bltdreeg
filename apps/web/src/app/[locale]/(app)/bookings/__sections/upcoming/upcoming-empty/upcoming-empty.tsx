import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

export function BookingsEmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("w-[190px] h-auto select-none", className)}
    >
      {/* جسم التقويم */}
      <rect x="34" y="26" width="132" height="110" rx="14" fill="#F7F8FA" stroke="#E5E7EB" strokeWidth="2.5" />
      {/* الخط الفاصل العلوي */}
      <path d="M34 56h132" stroke="#E5E7EB" strokeWidth="2.5" />
      {/* حلقات التعليق */}
      <path d="M66 18v18M134 18v18" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
      {/* خطوط الحجوزات */}
      <rect x="54" y="72" width="40" height="9" rx="4.5" fill="#E5E7EB" />
      <rect x="106" y="72" width="40" height="9" rx="4.5" fill="#E5E7EB" />
      <rect x="54" y="96" width="40" height="9" rx="4.5" fill="#E5E7EB" />
      <rect x="106" y="96" width="40" height="9" rx="4.5" fill="#E5E7EB" />
      {/* دائرة إضافة الحجز العائمة */}
      <circle cx="140" cy="112" r="26" fill="#fff" />
      <circle cx="140" cy="112" r="22" fill="#E6F0EF" stroke="#0F766E" strokeWidth="2.6" />
      {/* علامة الزائد */}
      <path d="M140 102v20M130 112h20" stroke="#0F766E" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function UpcomingEmpty() {
  const t = useTranslations("app.bookings");

  return (
    <section
      aria-label={t("empty.upcomingAria")}
      className="flex flex-col items-center justify-center gap-4 py-8 text-center md:py-12"
    >
      <BookingsEmptyIllustration />

      {/* العنوان والشرح */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[21px] font-extrabold text-foreground">
          {t("empty.upcomingTitle")}
        </h2>
        <p className="max-w-[380px] text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
          {t("empty.upcomingDesc")}
        </p>
      </div>

      {/* زر الاستكشاف */}
      <Link
        href={ROUTE_SEARCH}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-[10px] bg-primary px-7 text-[15px] font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary-pressed whitespace-nowrap cursor-pointer"
      >
        {t("empty.findSalon")}
      </Link>
    </section>
  );
}
