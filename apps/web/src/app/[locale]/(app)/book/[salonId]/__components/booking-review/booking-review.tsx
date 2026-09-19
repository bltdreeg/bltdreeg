import { Store, User, Calendar, Clock, AlertCircle } from "lucide-react";
import type { SalonDetails } from "@/lib/types/salon";
import type { Service } from "@/lib/types/service/service.interface";
import type { Barber } from "@/lib/types/barber/barber.interface";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK_BARBER, ROUTE_BOOK_SLOT } from "@/lib/data/constants/routes.constants";
import { formatDayLabel, formatTime } from "@/lib/utils/format/date.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";

type BookingReviewProps = {
  salon: SalonDetails;
  services: Service[];
  barber: Barber | null;
  when: string;
  queryString: string;
  submit: (formData: FormData) => void;
};

export function BookingReview({ salon, services, barber, when, queryString, submit }: BookingReviewProps) {
  const isNow = when === "now";
  const totalMinutes = services.reduce((n, s) => n + s.durationMinutes, 0);
  const totalPrice = services.reduce((n, s) => n + s.price, 0);

  return (
    <form action={submit} className="flex flex-col gap-5">
      <div className="flex items-center gap-3 rounded-[14px] border border-border p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-muted text-muted-foreground">
          <Store className="size-5" />
        </div>
        <div>
          <div className="text-[14.5px] font-bold text-foreground">{salon.name}</div>
          <div className="text-xs text-muted-foreground">{salon.areaName}</div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[14px] border border-border p-3.5">
        <div className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" />
          <span className="text-[13.5px] font-semibold text-muted-foreground">الحلاق</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{barber?.name ?? "أي حلاق متاح"}</span>
          <Link href={`${ROUTE_BOOK_BARBER(salon.id)}?${queryString}`} className="text-xs font-bold text-primary">
            غيّر
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[14px] border border-border p-3.5">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-[13.5px] font-semibold text-muted-foreground">المعاد</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            {isNow ? "دلوقتي" : `${formatDayLabel(when)} · ${formatTime(when)}`}
          </span>
          <Link href={`${ROUTE_BOOK_SLOT(salon.id)}?${queryString}`} className="text-xs font-bold text-primary">
            غيّر
          </Link>
        </div>
      </div>

      {isNow ? (
        <div className="rounded-xl bg-accent p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="size-4.5 text-primary-pressed shrink-0" />
              <span className="text-sm font-bold text-primary-pressed">
                {salon.queue.peopleAhead === 0 ? "هتدخل على طول" : `دورك خلال ${salon.queue.waitMinutes} لـ ${salon.queue.waitMinutes + 10} دقيقة`}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-600" />
              </span>
              <span>لايف</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {salon.queue.peopleAhead === 0 ? "محدش قدامك" : `قدامك ${salon.queue.peopleAhead}`} · مدة خدمتك {totalMinutes} دقيقة
          </p>
          <p className="mt-2 text-xs text-muted-foreground">الوقت تقديري وبيتحدّث لحظياً حسب الكراسي الشغّالة.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-accent p-3.5">
          <div className="flex items-center gap-2">
            <Clock className="size-4.5 text-primary-pressed shrink-0" />
            <span className="text-sm font-bold text-primary-pressed">
              معادك {formatDayLabel(when)} الساعة {formatTime(when)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">تعالى قبل معادك بـ 5 دقايق عشان تلحق دورك.</p>
        </div>
      )}

      {/* سياسة الإلغاء مطابق لتصميم FRAME 08 */}
      <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-muted/60 p-5">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4 text-warning shrink-0" />
          <span className="text-[15px] font-bold text-foreground">سياسة الإلغاء</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-success" />
            <span className="text-[13.5px] leading-relaxed text-foreground">
              تقدر تلغي أو تأجّل لحد ساعتين قبل الميعاد من غير أي مشكلة.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warning" />
            <span className="text-[13.5px] leading-relaxed text-foreground">
              لو ألغيت في أقل من ساعتين، الصالون ممكن يحسبها مرة غياب.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-destructive" />
            <span className="text-[13.5px] leading-relaxed text-foreground">
              لو معدّيتش ومجيتش 3 مرات، حسابك بيتوقف عن الحجز في الصالون ده أسبوع.
            </span>
          </div>
        </div>

        <span className="border-t border-border/60 pt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          لو وصلت متأخر أكتر من 10 دقايق، ممكن يتاخد اللي بعدك في الدور وترجع بعده.
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-[14px] border border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">مجموع الخدمات</span>
          <span className="tabular font-bold text-foreground">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-2">
          <span className="font-bold text-foreground">الإجمالي</span>
          <span className="tabular text-[17px] font-extrabold text-foreground">{formatPrice(totalPrice)}</span>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">الدفع كاش في الفرع بعد الخدمة</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="flex h-13 w-full items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-pressed cursor-pointer"
        >
          {isNow ? "أكّد ودخّلني الطابور" : "أكّد الحجز"}
        </button>
        <span className="text-center text-xs text-muted-foreground">
          بتأكيدك أنت موافق على سياسة الإلغاء
        </span>
      </div>
    </form>
  );
}
