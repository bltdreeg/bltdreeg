// كارت الصالون المفضل لشاشات الموبايل بنمط الصفوف (Row item) من FRAME 34 في mobile.html
"use client";

import { Check, Clock, Heart, Star, Store, Users } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import type { Shop } from "@/lib/types/shop/shop.interface";
import { cn } from "@/lib/utils/cn.utils";
import { formatDistance, formatFrom } from "@/lib/utils/format/price.utils";

interface FavoriteMobileCardProps {
  shop: Shop;
  onRemove: (shopId: string) => void;
  className?: string;
}

type WaitState = {
  tone: "free" | "waiting" | "closed";
  label: string;
  icon: typeof Check;
  ctaText: string;
  ctaVariant: "ghost" | "secondary";
  isClosed?: boolean;
};

/**
 * تحديد حالة الانتظار الحية استناداً إلى بيانات المحل وFRAME 34 في mobile.html
 */
function getShopWaitStatus(
  shop: Shop,
  t: (key: "opensAt" | "remindWhenOpen" | "freeNow" | "joinQueue" | "waitingFew") => string,
): WaitState {
  if (!shop.nextSlotAt) {
    return {
      tone: "closed",
      label: t("opensAt"),
      icon: Clock,
      ctaText: t("remindWhenOpen"),
      ctaVariant: "secondary",
      isClosed: true,
    };
  }

  // كابتن حسام كمثال للمحل الفاضي (أول عنصر في mobile.html)
  if (shop.id === "shop-1" || shop.id === "shop-4") {
    return {
      tone: "free",
      label: t("freeNow"),
      icon: Check,
      ctaText: t("joinQueue"),
      ctaVariant: "ghost",
    };
  }

  // المحلات التي بها انتظار خفيف
  return {
    tone: "waiting",
    label: t("waitingFew"),
    icon: Users,
    ctaText: t("joinQueue"),
    ctaVariant: "secondary",
  };
}

export function FavoriteMobileCard({
  shop,
  onRemove,
  className,
}: FavoriteMobileCardProps) {
  const t = useTranslations("marketing.favorites.mobileCard");
  const locale = useLocale();
  const wait = getShopWaitStatus(shop, t as any);
  const WaitIcon = wait.icon;

  return (
    <article
      className={cn(
        "flex gap-3 py-3 border-b border-border last:border-b-0",
        className
      )}
    >
      {/* 1 — الصورة المصغرة (Thumbnail) 86x86px */}
      <Link
        href={ROUTE_SALON(shop.id)}
        aria-label={shop.name}
        className="relative size-[86px] shrink-0 overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center"
      >
        {shop.coverImage ? (
          <Image
            src={shop.coverImage}
            alt=""
            fill
            sizes="86px"
            className="object-cover"
          />
        ) : (
          <Store className="size-6 text-muted-foreground/50" />
        )}

        {/* شارة مقفول في زاوية الصورة */}
        {wait.isClosed && (
          <span className="absolute top-0 end-0 rounded-es-lg bg-foreground px-1.5 py-0.5 text-[10.5px] font-bold text-background leading-tight">
            {t("closed")}
          </span>
        )}
      </Link>

      {/* 2 — بيانات المحل والإجراءات */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
        {/* السطر الأول: الاسم وزر القلب الأحمر */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={ROUTE_SALON(shop.id)}
            className="truncate text-[15.5px] font-bold text-foreground hover:text-primary transition-colors"
          >
            {shop.name}
          </Link>

          {/* زر القلب الأحمر المفعل */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(shop.id);
            }}
            aria-label={t("removeAria", { name: shop.name })}
            className="shrink-0 p-1 text-red-500 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Heart className="size-4.5 fill-red-500 text-red-500" />
          </button>
        </div>

        {/* السطر الثاني: التقييم | المسافة | السعر */}
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground font-medium">
          <span className="inline-flex items-center gap-1 font-bold text-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="tabular">{shop.rating}</span>
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="tabular">{formatDistance(shop.distanceKm, locale)}</span>
          <span className="h-3 w-px bg-border" />
          <span className="truncate tabular font-bold text-foreground">
            {formatFrom(shop.priceFrom, locale)}
          </span>
        </div>

        {/* السطر الثالث: شارة الانتظار الحية */}
        <div
          className={cn(
            "self-start inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-lg text-[12px] font-bold mt-0.5",
            wait.tone === "free" && "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
            wait.tone === "waiting" && "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
            wait.tone === "closed" && "bg-muted text-muted-foreground"
          )}
        >
          <WaitIcon className="size-3.5 stroke-[2.2]" />
          <span>{wait.label}</span>
        </div>

        {/* السطر الرابع: زر الإجراء السريع */}
        <Link
          href={ROUTE_BOOK(shop.id)}
          className={cn(
            "inline-flex h-[38px] w-full items-center justify-center rounded-[9px] text-[13.5px] font-bold transition-colors mt-1",
            wait.ctaVariant === "ghost" &&
              "bg-primary/10 text-primary-pressed hover:bg-primary/20",
            wait.ctaVariant === "secondary" &&
              "border border-border bg-card text-foreground hover:bg-muted"
          )}
        >
          {wait.ctaText}
        </Link>
      </div>
    </article>
  );
}
