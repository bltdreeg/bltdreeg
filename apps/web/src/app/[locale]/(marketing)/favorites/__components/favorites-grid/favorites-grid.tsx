// شبكة وقائمة الصالونات المفضلة المتجاوبة — FRAME 12B و FRAME 34
"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { shops } from "@/lib/data/shops.constants";
import { useFavorites } from "@/lib/hooks/favorites/use-favorites.hook";
import { FavoriteCard } from "../favorite-card";
import { FavoriteMobileCard } from "../favorite-mobile-card";
import { FavoritesEmpty } from "../favorites-empty";
import { FavoritesTipBox } from "../favorites-tip-box";

type SortOption = "slot" | "rating" | "distance";

export function FavoritesGrid() {
  const t = useTranslations("marketing.favorites");
  const router = useRouter();
  const { favoriteIds, removeFavorite } = useFavorites();
  const [sortBy, setSortBy] = useState<SortOption>("slot");

  const favoriteShops = useMemo(() => {
    const list = shops.filter((s) => favoriteIds.includes(s.id));

    return list.sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      if (sortBy === "distance") {
        return a.distanceKm - b.distanceKm;
      }
      // default: slot time
      if (!a.nextSlotAt) return 1;
      if (!b.nextSlotAt) return -1;
      return new Date(a.nextSlotAt).getTime() - new Date(b.nextSlotAt).getTime();
    });
  }, [favoriteIds, sortBy]);

  return (
    <div className="flex flex-col">
      {/* 1 — شريط المسار (Breadcrumb) يظهر في التابلت والدسكتوب */}
      <ProfileBreadcrumb
        items={[{ label: t("title") }]}
        className="hidden md:block"
      />

      <PageContainer className="flex flex-col gap-4 py-4 md:gap-6 md:py-9">
        {/* 2 — رأس الصفحة لشاشات الموبايل (FRAME 34) */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={t("back")}
            className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] border border-border bg-card text-foreground transition-colors hover:bg-muted cursor-pointer"
          >
            <ChevronRight className="size-5 rtl:rotate-0 ltr:rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-extrabold text-foreground">
              {t("title")}
            </h1>
            <p className="text-[12px] font-medium text-muted-foreground">
              {t("mobileSubtitle", { count: favoriteShops.length })}
            </p>
          </div>
        </div>

        {/* 3 — رأس الصفحة لشاشات التابلت والدسكتوب (FRAME 12B) */}
        <div className="hidden md:flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-baseline">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-[26px] font-extrabold text-foreground md:text-[28px]">
              {t("title")}
            </h1>
            <span className="text-sm text-muted-foreground">
              {t("desktopSubtitle", { count: favoriteShops.length })}
            </span>
          </div>

          {/* اختيار الترتيب في الدسكتوب */}
          {favoriteShops.length > 0 && (
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label={t("sortAria")}
                className="h-10 cursor-pointer appearance-none rounded-[10px] border border-border bg-card pe-9 ps-3.5 text-[13.5px] font-bold text-foreground transition-colors hover:bg-muted focus:border-primary focus:outline-none"
              >
                <option value="slot">{t("sortOptions.slot")}</option>
                <option value="rating">{t("sortOptions.rating")}</option>
                <option value="distance">{t("sortOptions.distance")}</option>
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute end-3 size-4 text-muted-foreground"
              />
            </div>
          )}
        </div>

        {/* 4 — المحتوى: إما الكروت أو الحالة الفاضية */}
        {favoriteShops.length === 0 ? (
          <FavoritesEmpty />
        ) : (
          <>
            {/* عرض الموبايل: قائمة صفوف مدمجة + صندوق التنبيه (FRAME 34) */}
            <div className="flex flex-col md:hidden">
              <div className="flex flex-col divide-y divide-border">
                {favoriteShops.map((shop) => (
                  <FavoriteMobileCard
                    key={shop.id}
                    shop={shop}
                    onRemove={removeFavorite}
                  />
                ))}
              </div>
              <FavoritesTipBox />
            </div>

            {/* عرض التابلت والدسكتوب: شبكة كروت التذاكر (FRAME 12B) */}
            <div className="hidden md:grid grid-cols-2 gap-5 lg:grid-cols-4">
              {favoriteShops.map((shop) => (
                <FavoriteCard
                  key={shop.id}
                  shop={shop}
                  onRemove={removeFavorite}
                />
              ))}
            </div>
          </>
        )}
      </PageContainer>
    </div>
  );
}
