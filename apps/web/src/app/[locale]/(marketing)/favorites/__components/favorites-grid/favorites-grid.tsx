// شبكة الصالونات المفضلة مع شريط التنقل والترتيب — FRAME 12B
"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageContainer } from "@/components/atoms/page-container";
import { ROUTE_ACCOUNT } from "@/lib/data/constants/routes.constants";
import { shops } from "@/lib/data/shops.constants";
import { useFavorites } from "@/lib/hooks/favorites/use-favorites.hook";
import { FavoriteCard } from "../favorite-card";
import { FavoritesEmpty } from "../favorites-empty";

type SortOption = "slot" | "rating" | "distance";

export function FavoritesGrid() {
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
      {/* 1 — شريط المسار (Breadcrumb) */}
      <div className="border-b border-border bg-card">
        <PageContainer className="flex h-14 items-center gap-3">
          <Link
            href={ROUTE_ACCOUNT}
            className="text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            حسابي
          </Link>
          <ChevronLeft className="size-3.5 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          <span className="text-[13px] font-bold text-foreground">
            الصالونات المفضلة
          </span>
        </PageContainer>
      </div>

      <PageContainer className="flex flex-col gap-6 py-8 md:py-9">
        {/* 2 — رأس الصفحة مع الفلتر */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-baseline">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-[26px] font-extrabold text-foreground md:text-[28px]">
              الصالونات المفضلة
            </h1>
            <span className="text-sm text-muted-foreground">
              {favoriteShops.length} صالونات · المواعيد المعروضة النهارده
            </span>
          </div>

          {/* اختيار الترتيب */}
          {favoriteShops.length > 0 && (
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="ترتيب الصالونات"
                className="h-10 cursor-pointer appearance-none rounded-[10px] border border-border bg-card pe-9 ps-3.5 text-[13.5px] font-bold text-foreground transition-colors hover:bg-muted focus:border-primary focus:outline-none"
              >
                <option value="slot">الأقرب ميعاد</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="distance">الأقرب مسافة</option>
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute end-3 size-4 text-muted-foreground"
              />
            </div>
          )}
        </div>

        {/* 3 — المحتوى: إما الكروت أو الحالة الفاضية */}
        {favoriteShops.length === 0 ? (
          <FavoritesEmpty />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {favoriteShops.map((shop) => (
              <FavoriteCard
                key={shop.id}
                shop={shop}
                onRemove={removeFavorite}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}

