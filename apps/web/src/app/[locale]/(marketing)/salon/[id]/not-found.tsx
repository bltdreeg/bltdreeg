import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";

export default function SalonNotFound() {
  const t = useTranslations("marketing.salon.notFound");

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="text-[48px]" aria-hidden>
        ✂️
      </span>
      <h1 className="text-[22px] font-bold">{t("title")}</h1>
      <p className="text-[14px] text-muted-foreground">
        {t("description")}
      </p>
      <Link
        href={ROUTE_HOME}
        className="mt-2 rounded-[9px] bg-primary px-6 py-3 text-[14px] font-bold text-primary-foreground hover:bg-primary-pressed"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
