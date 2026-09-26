import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { BookingsEmptyIllustration } from "../../upcoming/upcoming-empty";

export function PastEmpty() {
  const t = useTranslations("app.bookings");

  return (
    <section
      aria-label={t("empty.pastAria")}
      className="flex flex-col items-center justify-center gap-4 py-8 text-center md:py-12"
    >
      <BookingsEmptyIllustration />

      {/* العنوان والشرح */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[21px] font-extrabold text-foreground">
          {t("empty.pastTitle")}
        </h2>
        <p className="max-w-[380px] text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
          {t("empty.pastDesc")}
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
