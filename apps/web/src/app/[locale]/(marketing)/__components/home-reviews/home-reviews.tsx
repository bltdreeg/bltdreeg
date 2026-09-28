import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/atoms/avatar";
import { PageContainer } from "@/components/atoms/page-container";
import { Rating } from "@/components/atoms/rating";
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

const TESTIMONIALS = [
  {
    id: "t1",
    rating: 5,
    body: "كنت بكره إني أقعد مستني في الصالون ساعة على الفاضي. دلوقتي بشوف رقمي في الدور من الموبايل وأنزل قبلها بعشر دقايق وخلاص.",
    name: "محمود عبد العال",
    area: "المعادي، القاهرة",
  },
  {
    id: "t2",
    rating: 5,
    body: "حجزت لابني أول مرة في بربر لاونج وطلع الميعاد فاضي بالظبط. الحلاق كان مستنينا والدور ماشي بالترتيب، مفيش حد بيتخطى.",
    name: "كريم مصطفى",
    area: "مدينة نصر، القاهرة",
  },
  {
    id: "t3",
    rating: 4,
    body: "الصالون اتأخر ربع ساعة وجالي تنبيه إن ميعادي بقى 7:15. مضايقني إنه اتأخر، بس على الأقل عرفت وأنا في البيت ومشيتش على الفاضي.",
    name: "أحمد مجدي",
    area: "الدقي، الجيزة",
  },
] as const;

function HomeReviews() {
  const t = useTranslations("marketing.home.reviews");

  return (
    <PageContainer as="section" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold md:text-[21px]">{t("title")}</h2>
        <Link
          href={ROUTE_SEARCH}
          className="shrink-0 whitespace-nowrap text-[13.5px] font-bold text-primary hover:text-primary-pressed"
        >
          {t("allReviews")}
        </Link>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <li
            key={t.id}
            className="flex flex-col rounded-[14px] border border-border bg-background p-6 transition-colors hover:border-primary/30"
          >
            <Rating value={t.rating} showStars starSize={15} />

            {/* علامة اقتباس بتفصل النجوم عن النص */}
            <Quote
              aria-hidden
              className="mt-4 size-5 shrink-0 rotate-180 fill-primary/10 text-primary/10"
            />
            <p className="mt-1.5 text-[14.5px] leading-[1.9] text-pretty text-foreground/90">
              {t.body}
            </p>

            <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
              <Avatar name={t.name} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[13.5px] font-bold">{t.name}</span>
                <span className="truncate text-[12.5px] text-muted-foreground">
                  {t.area}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

export { HomeReviews };
