import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { chipVariants } from "@/components/atoms/chip";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import type { Area } from "@/lib/types/area/area.interface";
import { cn } from "@/lib/utils/cn.utils";

const SERVICE_KEYS = [
  "haircut",
  "beardTrim",
  "razorShave",
  "hairDye",
  "kidsHaircut",
] as const;

type QuickSearchProps = {
  /** المناطق القريبة — 4 في شبكة 2×2 */
  areas: Area[];
  /** عدد الصالونات اللي فيها ميعاد النهارده لكل منطقة */
  availableToday: Record<string, number>;
};

function QuickSearch({ areas, availableToday }: QuickSearchProps) {
  const t = useTranslations("marketing.search.quickSearch");

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[17px] font-bold">{t("title")}</h2>

      <ul className="flex flex-wrap gap-2">
        {SERVICE_KEYS.map((key) => {
          const service = t(`services.${key}`);
          return (
            <li key={key}>
              <Link
                href={`${ROUTE_SEARCH}?q=${encodeURIComponent(service)}`}
                className={cn(chipVariants(), "px-[15px]")}
              >
                {service}
              </Link>
            </li>
          );
        })}
      </ul>

      <h3 className="text-[13px] font-semibold text-muted-foreground">{t("nearbyAreas")}</h3>
      <ul className="grid grid-cols-2 gap-3">
        {areas.map((area) => (
          <li key={area.id}>
            <Link
              href={`${ROUTE_SEARCH}?q=${encodeURIComponent(area.name)}`}
              className="flex h-full flex-col gap-1.5 rounded-[12px] border border-border bg-card p-3.5 transition-colors hover:border-tint-border hover:bg-tint focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="flex items-center gap-1.5 text-[15px] font-bold">
                <MapPin aria-hidden className="size-3.5 text-primary" />
                {area.name}
              </span>
              <span className="tabular text-[13px] text-muted-foreground">
                {t("shopCount", { count: area.shopCount })}
              </span>
              <span className="tabular text-[11.5px] font-semibold text-primary">
                {t("availableToday", { count: availableToday[area.id] ?? 0 })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { QuickSearch };
