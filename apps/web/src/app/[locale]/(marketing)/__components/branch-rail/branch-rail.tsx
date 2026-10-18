"use client";

// صف فروع في الرئيسية من /branches بترتيب معيّن (الأحدث / الأرخص) — بيختفي لو مفيش نتايج
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/atoms/page-container";
import { Skeleton } from "@/components/atoms/skeleton";
import { BranchCard } from "@/components/molecules/branch-card";
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { useBranchFeed } from "@/lib/hooks/branches";
import { useVisitorPosition } from "@/lib/hooks/geo";
import type { BranchFilters } from "@/lib/types/branch";
import { toBranchSearchQuery } from "@/lib/utils/branches/branch-search-params";

const RAIL_SIZE = 4;

type BranchRailProps = {
  title: string;
  subtitle?: string;
  filters: BranchFilters;
};

function BranchRail({ title, subtitle, filters }: BranchRailProps) {
  const t = useTranslations("marketing.home.rails");
  const { position, settled } = useVisitorPosition();
  const feed = useBranchFeed(filters, position, { enabled: settled, perPage: RAIL_SIZE });
  const items = feed.data?.pages[0]?.items ?? [];
  const query = toBranchSearchQuery(filters);

  if (!feed.isPending && items.length === 0) return null;

  return (
    <PageContainer as="section" className="flex flex-col gap-3 pt-6 md:pt-11">
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
          <h2 className="text-lg font-bold md:text-[21px]">{title}</h2>
          {subtitle && <p className="text-[13.5px] text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          href={query ? `${ROUTE_SEARCH}?${query}` : ROUTE_SEARCH}
          className="shrink-0 whitespace-nowrap text-[13.5px] font-bold text-primary hover:text-primary-pressed"
        >
          {t("viewAll")}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {feed.isPending
          ? Array.from({ length: RAIL_SIZE }, (_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-[14px]" />)
          : items.map((branch) => <BranchCard key={branch.id} branch={branch} />)}
      </div>
    </PageContainer>
  );
}

export { BranchRail };
