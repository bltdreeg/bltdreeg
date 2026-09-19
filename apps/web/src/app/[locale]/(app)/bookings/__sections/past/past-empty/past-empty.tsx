// الحالة الفاضية للحجوزات السابقة — باستخدام نفس الرسمة الفيكتورية من الفريم ١١
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { BookingsEmptyIllustration } from "../../upcoming/upcoming-empty";

export function PastEmpty() {
  return (
    <section
      aria-label="لا توجد حجوزات سابقة"
      className="flex flex-col items-center justify-center gap-4 py-8 text-center md:py-12"
    >
      <BookingsEmptyIllustration />

      {/* العنوان والشرح */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[21px] font-extrabold text-foreground">
          لسه ما خلصتش أي حجز
        </h2>
        <p className="max-w-[380px] text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
          حجوزاتك اللي خلصت هتظهر هنا، وتقدر تعيد حجزها بضغطة واحدة.
        </p>
      </div>

      {/* زر الاستكشاف */}
      <Link
        href={ROUTE_SEARCH}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-[10px] bg-primary px-7 text-[15px] font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary-pressed whitespace-nowrap cursor-pointer"
      >
        دوّر على صالون قريب منك
      </Link>
    </section>
  );
}
