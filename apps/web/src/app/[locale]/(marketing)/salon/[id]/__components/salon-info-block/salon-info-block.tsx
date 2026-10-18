"use client";

import { Heart, Navigation, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/components/atoms/toast";
import { ROUTE_FAVORITES } from "@/lib/data/constants/routes.constants";
import { useFavorites } from "@/lib/hooks/favorites/use-favorites.hook";
import type { BranchDetail } from "@/lib/types/branch";
import { cn } from "@/lib/utils/cn.utils";
import { formatDistance, formatFrom } from "@/lib/utils/format/price.utils";
import { branchDirectionsUrl } from "@/lib/utils/branches/branch-links";

type SalonInfoBlockProps = {
  branch: BranchDetail;
};

/** راس صفحة الصالون: الاسم والفرع والمنطقة + المفضلة والاتجاهات والاتصال (التقييم والدور لما يبقى ليهم API) */
export function SalonInfoBlock({ branch }: SalonInfoBlockProps) {
  const t = useTranslations("marketing.salon.info");
  const locale = useLocale();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const isFav = isFavorite(branch.id);
  const displayName = branch.salon.name;

  const handleToggleFavorite = () => {
    toggleFavorite(branch.id);
    if (!isFav) {
      toast.success(
        t("toasts.addedTitle"),
        t("toasts.addedDesc", { name: displayName }),
        { label: t("toasts.viewFavorites"), href: ROUTE_FAVORITES }
      );
    } else {
      toast.info(t("toasts.removedTitle"), t("toasts.removedDesc", { name: displayName }));
    }
  };

  return (
    <div className="flex flex-col gap-3.5 px-4 sm:px-8 pt-4 pb-5 lg:px-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-[21px] font-extrabold text-foreground">{displayName}</h1>
        <p className="text-sm font-semibold text-muted-foreground">{branch.name}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">
        <span>{branch.city.name}</span>
        {branch.distanceKm !== null && (
          <>
            <span className="text-border">·</span>
            <span className="tabular">{formatDistance(branch.distanceKm, locale)}</span>
          </>
        )}
        {branch.priceFrom !== null && (
          <>
            <span className="text-border">·</span>
            <span className="tabular font-bold text-foreground">{formatFrom(branch.priceFrom, locale)}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap sm:flex-nowrap gap-2">
        {/* زر الإضافة للمفضلة */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={cn(
            "flex h-11 flex-1 min-w-[130px] items-center justify-center gap-1.5 rounded-xl border text-[13.5px] font-bold transition-all cursor-pointer select-none",
            isFav
              ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
              : "border-border bg-background text-foreground hover:bg-muted"
          )}
          aria-label={isFav ? t("removeAria") : t("addAria")}
        >
          <Heart
            className={cn(
              "size-4 shrink-0 transition-colors",
              isFav ? "fill-destructive text-destructive" : "text-muted-foreground"
            )}
          />
          <span>{isFav ? t("inFavorites") : t("addToFavorites")}</span>
        </button>

        <a
          href={branchDirectionsUrl(branch)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 flex-1 min-w-[100px] items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-[13.5px] font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Navigation className="size-4" />
          <span>{t("directions")}</span>
        </a>
        {branch.phone && (
          <a
            href={`tel:${branch.phone}`}
            className="flex h-11 flex-1 min-w-[90px] items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-[13.5px] font-bold text-foreground transition-colors hover:bg-muted"
          >
            <Phone className="size-4" />
            <span>{t("call")}</span>
          </a>
        )}
      </div>
    </div>
  );
}
