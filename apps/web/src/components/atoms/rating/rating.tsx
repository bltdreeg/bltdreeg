// عرض التقييم: 4.8 ★ 214 تقييم — النجمة clip-path زي التصميم، من غير مكتبة أيقونات
import { cn } from "@/lib/utils/cn.utils";

const STAR_CLIP =
  "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)";

function Star({ filled = true, size = 11 }: { filled?: boolean; size?: number }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0", filled ? "bg-foreground" : "bg-border")}
      style={{ width: size, height: size, clipPath: STAR_CLIP }}
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
  className?: string;
};

function Rating({ value, count, showStars = false, className }: RatingProps) {
  const label = count ? `${value} من 5، ${count} تقييم` : `${value} من 5`;

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={label}>
      {showStars ? (
        <span className="flex gap-[3px]">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} filled={i < Math.round(value)} size={13} />
          ))}
        </span>
      ) : (
        <>
          <span className="tabular text-[13px] font-bold text-foreground">{value}</span>
          <Star />
        </>
      )}
      {count !== undefined && (
        <span className="tabular text-[13px] text-muted-foreground">{count} تقييم</span>
      )}
    </div>
  );
}

export { Rating, Star, STAR_CLIP };
