// الحالة الفاضية للحجوزات السابقة — FRAME 10C
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

export function PastEmpty() {
  return (
    <section
      aria-label="لا توجد حجوزات سابقة"
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/40 p-10 text-center md:p-14"
    >
      {/* الرسمة التوضيحية لكرسي الحلاقة وساعة الوقت */}
      <div className="relative h-[104px] w-[140px]" aria-hidden>
        {/* مسند الكرسي */}
        <div className="absolute end-[46px] top-1 h-11 w-[46px] rounded-[11px_11px_4px_4px] border-[1.5px] border-primary bg-card" />
        {/* قاعدة الكرسي */}
        <div className="absolute end-10 top-12 h-[17px] w-[58px] rounded-[5px] border-[1.5px] border-primary bg-tint" />
        <div className="absolute end-[30px] top-[51px] h-[1.5px] w-3 bg-primary" />
        <div className="absolute end-[96px] top-[51px] h-[1.5px] w-3 bg-primary" />
        {/* عامود الكرسي */}
        <div className="absolute end-[68px] top-[65px] h-6 w-[1.5px] bg-primary" />
        {/* قاعدة الأرضية */}
        <div className="absolute end-[50px] top-[89px] h-[1.5px] w-[38px] bg-primary" />
        <div className="absolute end-[54px] top-[91px] h-[9px] w-[1.5px] rotate-[22deg] bg-[#9FCFC9]" />
        <div className="absolute end-[82px] top-[91px] h-[9px] w-[1.5px] -rotate-[22deg] bg-[#9FCFC9]" />

        {/* ساعة متقطعة */}
        <div className="absolute start-2 top-4 size-8 rounded-full border-[1.5px] border-dashed border-[#9FCFC9]" />
        <div className="absolute start-[22px] top-[22px] h-[11px] w-[1.5px] bg-[#9FCFC9]" />
        <div className="absolute start-[22px] top-8 h-[1.5px] w-[9px] bg-[#9FCFC9]" />
      </div>

      {/* العنوان والشرح */}
      <h2 className="text-[22px] font-bold text-foreground">
        لسه ما خلصتش أي حجز
      </h2>
      <p className="max-w-[360px] text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
        حجوزاتك اللي خلصت هتظهر هنا، وتقدر تعيد حجزها بضغطة واحدة.
      </p>

      {/* زر الحجز الأول */}
      <Link
        href={ROUTE_SEARCH}
        className="mt-1.5 inline-flex h-[46px] items-center justify-center rounded-[10px] bg-primary px-5.5 text-[14.5px] font-bold text-primary-foreground transition-colors hover:bg-primary-pressed whitespace-nowrap"
      >
        احجز ميعادك الأول
      </Link>
    </section>
  );
}

