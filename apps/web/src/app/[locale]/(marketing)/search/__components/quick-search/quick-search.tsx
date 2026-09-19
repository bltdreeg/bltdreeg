// بحث سريع: شرايح الخدمات + المناطق القريبة في شبكة 2×2
import { MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { chipVariants } from "@/components/atoms/chip";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import type { Area } from "@/lib/types/area/area.interface";
import { cn } from "@/lib/utils/cn.utils";

const SERVICES = ["قص شعر", "تحديد دقن", "حلاقة بالموس", "صبغة", "قص شعر أطفال"];

type QuickSearchProps = {
  /** المناطق القريبة — 4 في شبكة 2×2 */
  areas: Area[];
  /** عدد الصالونات اللي فيها ميعاد النهارده لكل منطقة */
  availableToday: Record<string, number>;
};

function QuickSearch({ areas, availableToday }: QuickSearchProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[17px] font-bold">بحث سريع</h2>

      <ul className="flex flex-wrap gap-2">
        {SERVICES.map((service) => (
          <li key={service}>
            <Link
              href={`${ROUTE_SEARCH}?q=${encodeURIComponent(service)}`}
              className={cn(chipVariants(), "px-[15px]")}
            >
              {service}
            </Link>
          </li>
        ))}
      </ul>

      <h3 className="text-[13px] font-semibold text-muted-foreground">مناطق قريبة منك</h3>
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
                {area.shopCount} صالون
              </span>
              <span className="tabular text-[11.5px] font-semibold text-primary">
                {availableToday[area.id] ?? 0} فيها ميعاد النهارده
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { QuickSearch };
