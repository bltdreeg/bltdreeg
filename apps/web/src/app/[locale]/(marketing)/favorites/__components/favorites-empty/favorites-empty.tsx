// الحالة الفاضية للمفضلة — رسمة المحل والقلب والعناوين والأزرار من FRAME 35 في mobile.html و FRAME 12B في web.html
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKINGS, ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

export function FavoritesEmpty() {
  return (
    <section
      aria-label="لا توجد صالونات مفضلة"
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/40 p-8 text-center md:p-14"
    >
      {/* الرسمة التوضيحية للمحل والقلب من Frame 35 في mobile.html */}
      <svg
        viewBox="0 0 180 160"
        className="h-auto w-[150px] md:w-[170px]"
        aria-hidden="true"
      >
        <circle cx="90" cy="80" r="62" className="fill-muted/70" />
        <g
          fill="none"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-primary"
        >
          <path d="M66 96V62" />
          <path d="M62 62l5-14h46l5 14" />
          <path d="M114 62v34" />
          <path d="M58 96h64v20a6 6 0 0 1-6 6H64a6 6 0 0 1-6-6z" />
          <path d="M80 122v-14h20v14" />
        </g>
        <path
          d="M132 44c-6 0-11 5-11 11 0 9 11 17 11 17s11-8 11-17c0-6-5-11-11-11z"
          fill="#ffffff"
          stroke="#EF4444"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>

      {/* العنوان والشرح */}
      <h2 className="text-[20px] font-extrabold text-foreground md:text-[22px]">
        مفيش صالونات مفضّلة
      </h2>
      <p className="max-w-[460px] text-[14px] leading-relaxed text-muted-foreground md:text-[14.5px] text-balance">
        دوس على القلب في أي صالون عشان يتحفظ هنا، وتقدر تشوف دوره وتدخل بضغطة واحدة من غير بحث كل مرة.
      </p>

      {/* أزرار الإجراءات */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href={ROUTE_SEARCH}
          className="inline-flex h-[46px] items-center justify-center rounded-[10px] bg-primary px-6 text-[14.5px] font-bold text-primary-foreground transition-colors hover:bg-primary-pressed whitespace-nowrap"
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
