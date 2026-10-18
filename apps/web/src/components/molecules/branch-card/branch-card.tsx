import { MapPin, Scissors } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import type { BranchListItem, NearbyBranch } from "@/lib/types/branch";
import { cn } from "@/lib/utils/cn.utils";
import { formatDistance, formatFrom } from "@/lib/utils/format/price.utils";

/** nearby بيرجّع الكارت الأساسي؛ البحث (/branches) بيزود السعر والخدمات وعلامة "جديد" */
type BranchCardProps = { branch: NearbyBranch | BranchListItem; className?: string };

function BranchCard({ branch, className }: BranchCardProps) {
  const locale = useLocale();
  const t = useTranslations("common.branchCard");
  const feed = "priceFrom" in branch ? branch : null;

  return (
    <Link
      href={ROUTE_SALON(branch.id)}
      className={cn(
        "group flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
      )}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {branch.coverImageUrl ? (
          <Image
            src={branch.coverImageUrl}
            alt={branch.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          <Scissors aria-hidden className="absolute inset-0 m-auto size-8 text-muted-foreground" />
        )}
        {feed?.isNew && (
          <span className="absolute start-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
            {t("new")}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="truncate text-[15px] font-bold group-hover:text-primary">{branch.salon.name}</h3>
        <p className="truncate text-[13px] text-muted-foreground">{branch.name}</p>
        <p className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">
            {branch.city.name} · {formatDistance(branch.distanceKm, locale)}
          </span>
        </p>
        {feed && feed.services.length > 0 && (
          <p className="truncate text-[12px] text-muted-foreground">{feed.services.join(" · ")}</p>
        )}
        {feed?.priceFrom != null && (
          <p className="tabular pt-0.5 text-[13px] font-extrabold text-foreground">{formatFrom(feed.priceFrom, locale)}</p>
        )}
      </div>
    </Link>
  );
}

export { BranchCard };
