import { CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn.utils";
import type { SalonDetails } from "@/lib/types/salon";
import type { Review } from "@/lib/types/review";
import { formatDayMonth } from "@/lib/utils/format/date.utils";

type ReviewSectionProps = {
  salon: SalonDetails;
  reviews: Review[];
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]} ${parts[1][0]}`;
  }
  return parts[0]?.[0] || "";
}

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            "shrink-0",
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200",
          )}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

export function ReviewSection({ salon, reviews }: ReviewSectionProps) {
  const counts = salon.ratingCounts || { 5: 94, 4: 26, 3: 11, 2: 4, 1: 3 };
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || salon.reviewCount;

  const breakdown = salon.ratingBreakdown && salon.ratingBreakdown.length > 0
    ? salon.ratingBreakdown
    : [
        { label: "جودة القصة", value: 4.7 },
        { label: "النظافة", value: 4.6 },
        { label: "دقة الوقت", value: 4.2 },
      ];

  return (
    <section
      id="reviews"
      className="scroll-mt-28 px-4 sm:px-8 lg:rounded-[14px] lg:border lg:border-border lg:bg-background lg:p-6 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* رأس القسم */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">التقييمات وآراء العملاء</h2>
        <span className="text-xs text-primary font-semibold cursor-pointer hover:underline">
          عرض كل الـ <span className="tabular">{total}</span> تقييم
        </span>
      </div>

      {/* لوحة تفصيل التقييم العام */}
      <div className="flex flex-col gap-6 rounded-xl border border-slate-100 bg-slate-50/50 p-5 lg:flex-row lg:items-center lg:gap-8 mb-6">
        {/* الرقم الكلي */}
        <div className="flex flex-col items-center gap-1 shrink-0 self-center lg:self-auto">
          <span className="tabular text-4xl font-black text-slate-900 leading-none">
            {salon.rating}
          </span>
          <StarRating rating={salon.rating} />
          <span className="tabular text-xs text-slate-400">
            {total} تقييم حقيقي
          </span>
        </div>

        {/* أشرطة التوزيع */}
        <div className="flex flex-1 flex-col gap-1.5 min-w-0">
          {([5, 4, 3, 2, 1] as const).map((stars) => {
            const count = counts[stars] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-2.5 text-xs">
                <span className="tabular flex w-6 items-center gap-0.5 font-bold text-slate-500">
                  {stars}
                  <Star className="size-2.5 fill-amber-400 text-amber-400" />
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className="absolute inset-y-0 start-0 rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="tabular w-7 text-left text-slate-400 text-[11px]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* المعايير التفصيلية */}
        <div className="flex flex-col gap-2 shrink-0 border-t border-slate-200/60 pt-4 lg:w-[200px] lg:border-t-0 lg:border-e lg:border-slate-200/60 lg:pe-6 lg:pt-0">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{item.label}</span>
              <span className="tabular font-bold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* كروت التقييمات الفردية */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {reviews.map((rv) => (
          <article
            key={rv.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <StarRating rating={rv.rating} />
              </div>
              <span className="tabular text-[11px] text-slate-400">
                {formatDayMonth(rv.createdAt)}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 text-pretty">
              {rv.comment}
            </p>

            <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tint text-xs font-bold text-accent-foreground">
                  {getInitials(rv.authorName)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900">
                      {rv.authorName}
                    </span>
                    <CheckCircle2 className="size-3 text-primary" />
                  </div>
                  {rv.barberName && (
                    <span className="text-[10px] text-slate-400">
                      مع {rv.barberName}
                    </span>
                  )}
                </div>
              </div>

              {rv.serviceName && (
                <span className="rounded-xl bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {rv.serviceName}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
