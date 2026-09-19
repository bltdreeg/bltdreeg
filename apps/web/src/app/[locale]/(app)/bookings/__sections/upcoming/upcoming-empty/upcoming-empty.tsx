// الحالة الفاضية للحجوزات القادمة — FRAME 10C
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

export function UpcomingEmpty() {
  return (
    <section
      aria-label="لا توجد حجوزات قادمة"
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/40 p-10 text-center md:p-14"
    >
      {/* الرسمة التوضيحية لنتيجة التقويم */}
      <div className="relative h-[104px] w-[140px]" aria-hidden>
        <div className="absolute end-[18px] top-2 h-[88px] w-[104px] rounded-[10px] border-[1.5px] border-primary bg-card" />
        <div className="absolute end-[18px] top-[30px] h-[1.5px] w-[104px] bg-primary" />
        <div className="absolute end-10 top-0 h-4 w-[1.5px] bg-primary" />
        <div className="absolute end-[100px] top-0 h-4 w-[1.5px] bg-primary" />

        {/* المربعات المتقطعة */}
        <div className="absolute end-7 top-11 h-[13px] w-[18px] rounded-[3px] border-[1.5px] border-dashed border-[#9FCFC9]" />
        <div className="absolute end-[52px] top-11 h-[13px] w-[18px] rounded-[3px] border-[1.5px] border-dashed border-[#9FCFC9]" />
        <div className="absolute end-[76px] top-11 h-[13px] w-[18px] rounded-[3px] border-[1.5px] border-dashed border-[#9FCFC9]" />
        <div className="absolute end-[100px] top-11 h-[13px] w-[18px] rounded-[3px] border-[1.5px] border-dashed border-[#9FCFC9]" />

        <div className="absolute end-7 top-[68px] h-[13px] w-[18px] rounded-[3px] border-[1.5px] border-dashed border-tint-border" />
        <div className="absolute end-[52px] top-[68px] h-[13px] w-[18px] rounded-[3px] border-[1.5px] border-dashed border-tint-border" />
        <div className="absolute end-[76px] top-[68px] h-[13px] w-[18px] rounded-[3px] border-[1.5px] border-dashed border-tint-border" />
        <div className="absolute end-[100px] top-[68px] h-[13px] w-[18px] rounded-[3px] border-[1.5px] border-dashed border-tint-border" />
      </div>

      {/* العنوان والشرح */}
      <h2 className="text-[22px] font-bold text-foreground">
        مفيش حجوزات قادمة
      </h2>
      <p className="max-w-[340px] text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
        لما تحجز ميعاد هيظهر هنا مع رقمك في الدور.
      </p>

      {/* زر الاستكشاف */}
      <Link
        href={ROUTE_SEARCH}
        className="mt-1.5 inline-flex h-[46px] items-center justify-center rounded-[10px] bg-primary px-5.5 text-[14.5px] font-bold text-primary-foreground transition-colors hover:bg-primary-pressed whitespace-nowrap"
      >
        اكتشف صالونات قريبة
      </Link>
    </section>
  );
}

