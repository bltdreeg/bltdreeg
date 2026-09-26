import { Scissors } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import type { Shop } from "@/lib/types/shop/shop.interface";
import { Period, groupByPeriod, slotsForShop } from "@/lib/utils/availability.utils";
import { formatDistance, formatFrom } from "@/lib/utils/format/price.utils";
import { SlotChips } from "../slot-chips";

// أقرب فترة فيها مواعيد فعلاً — بالليل الأول لأنه الأكتر ازدحام على التطبيق
const PERIOD_ORDER = [Period.EVENING, Period.AFTERNOON, Period.MORNING] as const;

type ResultCardProps = {
  shop: Shop;
};

function ResultCard({ shop }: ResultCardProps) {
  const t = useTranslations("marketing.search.resultCard");
  const locale = useLocale();
  const grouped = groupByPeriod(slotsForShop(shop));
  const period = PERIOD_ORDER.find((p) => grouped[p].length > 0) ?? Period.EVENING;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[14px] border border-border bg-card">
      <Link
        href={ROUTE_SALON(shop.id)}
        aria-label={shop.name}
        className="absolute inset-0 z-[1] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      />

      <div className="relative h-40 w-full overflow-hidden bg-muted">
        {shop.coverImage ? (
          <Image src={shop.coverImage} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        ) : (
          <Scissors
            aria-hidden
            className="absolute start-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-[#C6CBD2] rtl:translate-x-1/2"
          />
        )}
        {shop.isNew && (
          <span className="absolute top-2.5 end-2.5 rounded-[7px] bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            {t("newBadge")}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-4 pt-3.5">
        <h3 className="text-[16px] font-bold leading-tight">{shop.name}</h3>
        <p className="tabular text-[12.5px] text-muted-foreground">
          {shop.areaName} · {formatDistance(shop.distanceKm, locale)} · {shop.rating} · {t("reviews", { count: shop.reviewCount })}
        </p>
        <p className="tabular text-[12.5px] text-muted-foreground">
          {shop.services[0]} {formatFrom(shop.priceFrom, locale)}
        </p>
      </div>

      {/* خط التقطيع + خرمين: توقيع التذكرة */}
      <div className="relative mt-3.5">
        <div className="border-t border-dashed border-perforation" />
        <span
          aria-hidden
          className="absolute -top-2 -end-[9px] size-4 rounded-full border border-border bg-card"
        />
        <span
          aria-hidden
          className="absolute -top-2 -start-[9px] size-4 rounded-full border border-border bg-card"
        />
      </div>

      <div className="px-4 pb-4 pt-3">
        <SlotChips shopId={shop.id} period={period} slots={grouped[period]} />
      </div>
    </article>
  );
}

export { ResultCard };
