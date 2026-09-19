// مفيش نتايج: الرسم، السبب بالظبط (بالفلاتر المفعّلة)، وطرق قدام المستخدم
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/atoms/button";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";
import { formatDistance, formatPrice } from "@/lib/utils/format/price.utils";

type NoResultsProps = {
  /** النص اللي مالقاش نتايج */
  query: string;
  areaName: string;
  /** الفلاتر المفعّلة — بتتضاف لجملة السبب لو موجودة */
  maxDistanceKm?: number;
  maxPrice?: number;
  hasFilters: boolean;
};

function NoResults({ query, areaName, maxDistanceKm, maxPrice, hasFilters }: NoResultsProps) {
  const reason = [
    `في ${areaName}`,
    maxDistanceKm !== undefined ? `لحد ${formatDistance(maxDistanceKm)}` : null,
    maxPrice !== undefined ? `وبسعر لحد ${formatPrice(maxPrice)}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="flex flex-col items-center gap-5 py-10 text-center">
      <span
        aria-hidden
        className="flex size-20 items-center justify-center rounded-full border border-dashed border-perforation bg-muted"
      >
        <SearchX className="size-8 text-[#C6CBD2]" />
      </span>

      <div className="flex flex-col gap-2">
        <h2 className="text-[21px] font-bold">مفيش صالون بالاسم ده</h2>
        <p className="max-w-[420px] text-[15px] leading-relaxed text-muted-foreground">
          دوّرنا على «{query}» {reason} ومالقيناش حاجة. جرّب تفك فلتر أو توسّع المسافة.
        </p>
      </div>

      <div className="flex w-full max-w-[300px] flex-col gap-2.5">
        {hasFilters && (
          <Link
            href={`${ROUTE_SEARCH}?q=${encodeURIComponent(query)}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 w-full rounded-[10px] text-[15px] font-bold",
            )}
          >
            مسح الفلاتر
          </Link>
        )}
        <Link
          href={`${ROUTE_SEARCH}?q=${encodeURIComponent(query)}&maxDistanceKm=10`}
          className={cn(buttonVariants(), "h-11 w-full rounded-[10px] text-[15px] font-bold")}
        >
          وسّع نطاق البحث لـ 10 كم
        </Link>
        <Link
          href={ROUTE_SEARCH}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full rounded-[10px] text-[15px] font-bold",
          )}
        >
          جرّب تاريخ تاني
        </Link>
      </div>
    </section>
  );
}

export { NoResults };
