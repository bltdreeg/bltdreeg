// الحالة الفاضية للمفضلة — رسمة التذاكر والعناوين والأزرار من FRAME 12B
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKINGS, ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

export function FavoritesEmpty() {
  return (
    <section
      aria-label="لا توجد صالونات مفضلة"
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/40 p-10 text-center md:p-14"
    >
      {/* الرسمة التوضيحية للتذاكر والشارة */}
      <div
        className="relative h-[98px] w-[134px]"
        aria-hidden
      >
        <div className="absolute end-0 top-3.5 h-14 w-[78px] rounded-[10px] border-[1.5px] border-tint-border bg-card" />
        <div className="absolute end-5 top-6 h-14 w-[78px] rounded-[10px] border-[1.5px] border-[#B7DCD8] bg-card" />
        <div className="absolute end-10 top-[34px] h-14 w-[78px] rounded-[10px] border-[1.5px] border-[#9FCFC9] bg-card" />
        <div className="absolute end-[62px] top-[34px] h-14 w-0 border-e-[1.5px] border-dashed border-[#9FCFC9]" />
        <div className="absolute end-12 top-12 h-[1.5px] w-[26px] bg-tint-border" />
        <div className="absolute end-12 top-16 h-[1.5px] w-[18px] bg-tint-border" />
        <div className="absolute end-[84px] top-4 h-12 w-[26px] rounded-md border-[1.5px] border-primary bg-tint" />
        <div className="absolute end-[92px] top-[30px] size-2.5 rounded-full bg-primary" />
      </div>

      {/* العنوان والشرح */}
      <h2 className="text-[22px] font-bold text-foreground">
        مفيش صالونات محفوظة
      </h2>
      <p className="max-w-[460px] text-[14.5px] leading-relaxed text-muted-foreground text-balance">
        احفظ الصالونات اللي بتروحها، وهتلاقي أقرب ميعاد فاضي في كل واحد منهم هنا على طول — من غير بحث كل مرة.
      </p>

      {/* أزرار الإجراءات */}
      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href={ROUTE_SEARCH}
          className="inline-flex h-[46px] items-center justify-center rounded-[10px] bg-primary px-5.5 text-[14.5px] font-bold text-primary-foreground transition-colors hover:bg-primary-pressed whitespace-nowrap"
        >
          اكتشف صالونات قريبة
        </Link>
        <Link
          href={ROUTE_BOOKINGS}
          className="inline-flex h-[46px] items-center justify-center rounded-[10px] border border-border bg-card px-5 text-[14.5px] font-bold text-foreground transition-colors hover:bg-muted whitespace-nowrap"
        >
          صالونات زرتها قبل كده
        </Link>
      </div>
    </section>
  );
}

