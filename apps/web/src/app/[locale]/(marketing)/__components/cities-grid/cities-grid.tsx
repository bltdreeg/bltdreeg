"use client";

// استكشف حسب المنطقة: المحافظات من /geo/governorates، كل واحدة بتفتح البحث متفلتر بيها
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/atoms/page-container";
import { Skeleton } from "@/components/atoms/skeleton";
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { useGovernorates } from "@/lib/hooks/geo";
import { toBranchSearchQuery } from "@/lib/utils/branches/branch-search-params";
import { orderGovernorates } from "@/lib/utils/location/governorate-order";

const MAX_AREAS = 10;

function CitiesGrid() {
  const t = useTranslations("marketing.home.areas");
  const governorates = useGovernorates();

  if (governorates.isError || (governorates.data && governorates.data.length === 0)) return null;

  return (
    <PageContainer as="section" className="py-10 md:py-12">
      <div className="mb-4.5 flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
        <h2 className="text-lg font-bold md:text-[21px]">{t("title")}</h2>
        <p className="text-[13.5px] text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ul className="grid grid-cols-2 gap-3.5 md:grid-cols-5">
        {governorates.isPending
          ? Array.from({ length: MAX_AREAS }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-[54px] rounded-xl" />
              </li>
            ))
          : orderGovernorates(governorates.data).slice(0, MAX_AREAS).map((governorate) => (
              <li key={governorate.id}>
                <Link
                  href={`${ROUTE_SEARCH}?${toBranchSearchQuery({ governorateId: governorate.id })}`}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4.5 py-4 transition-colors hover:border-primary hover:bg-tint"
                >
                  <MapPin className="size-3.5 text-primary shrink-0" />
                  <span className="truncate text-[15px] font-bold md:text-base">{governorate.name}</span>
                </Link>
              </li>
            ))}
      </ul>
    </PageContainer>
  );
}

export { CitiesGrid };
