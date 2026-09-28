import { Star as LucideStar } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn.utils";

const STAR_CLIP =
  "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)";

function Star({ filled = true, size = 12 }: { filled?: boolean; size?: number }) {
  return (
    <LucideStar
      aria-hidden
      className={cn(
        "shrink-0",
        filled ? "fill-amber-400 text-amber-400" : "fill-border text-border",
      )}
      style={{ width: size, height: size }}
    />
  );
}

type RatingProps = {
  /** متوسط التقييم، مثال 4.8 */
  value: number;
  /** عدد التقييمات — لو مش موجود مابنعرضش السطر */
  count?: number;
  /** عرض 5 نجوم بدل نجمة واحدة */
  showStars?: boolean;
  /** حجم النجمة في وضع الـ 5 نجوم */
  starSize?: number;
  className?: string;
};

function Rating({ value, count, showStars = false, starSize = 13, className }: RatingProps) {
  const t = useTranslations("common.rating");
  const label = count
    ? t("outOfWithCount", { rating: value, count })
    : t("outOf", { rating: value });

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={label}>
      {showStars ? (
        <span className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} filled={i < Math.round(value)} size={starSize} />
          ))}
        </span>
      ) : (
        <>
          <span className="tabular text-[13px] font-bold text-foreground">{value}</span>
          <Star />
        </>
      )}
      {count !== undefined && (
        <span className="tabular text-[13px] text-muted-foreground">
          {t("reviewsCount", { count })}
        </span>
      )}
    </div>
  );
}

export { Rating, Star, STAR_CLIP };
