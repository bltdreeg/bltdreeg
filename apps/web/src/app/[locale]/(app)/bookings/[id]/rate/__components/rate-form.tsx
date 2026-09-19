"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Camera, Check, ArrowRight, Store, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/atoms/button";
import { ROUTE_BOOKINGS, ROUTE_BOOKING_RATE_SENT } from "@/lib/data/constants/routes.constants";
import { submitBookingRating } from "@/lib/actions/bookings/bookings.action";
import type { Booking } from "@/lib/types/booking";
import type { SalonDetails } from "@/lib/types/salon";
import { formatBookingDetailDate, formatTime } from "@/lib/utils/format/date.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { cn } from "@/lib/utils/cn.utils";

interface RateFormProps {
  booking: Booking;
  salon?: SalonDetails | null;
}

const RATING_LABELS: Record<number, string> = {
  5: "ممتاز",
  4: "حلو جداً",
  3: "كويس",
  2: "مقبول",
  1: "سيء",
};

const COMPLIMENT_TAGS = [
  "ايده خفيفة",
  "المكان نضيف",
  "معاملة محترمة",
  "السعر مناسب",
  "الدور كان دقيق",
];

export function RateForm({ booking, salon }: RateFormProps) {
  const router = useRouter();

  // Ratings state
  const [overallRating, setOverallRating] = useState<number>(4);
  const [haircutRating, setHaircutRating] = useState<number>(5);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(4);
  const [punctualityRating, setPunctualityRating] = useState<number>(3);

  // Additional options
  const [selectedTags, setSelectedTags] = useState<string[]>(["ايده خفيفة", "معاملة محترمة"]);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedPhoto(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitBookingRating(booking.id, overallRating, {
        haircutRating,
        cleanlinessRating,
        punctualityRating,
        tags: selectedTags,
        comment,
        isAnonymous,
      });
      router.push(ROUTE_BOOKING_RATE_SENT(booking.id));
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push(`${ROUTE_BOOKINGS}?tab=past`);
  };

  const salonImage =
    salon?.photos?.[0] || salon?.coverImage || "/images/salons/barber-lounge.webp";
  const shopName = booking.shopName || salon?.name || "صالون الكابتن حسام";
  const barberName = booking.barberName || "محمود عبد العال";
  const servicesText =
    booking.serviceNames && booking.serviceNames.length > 0
      ? booking.serviceNames.join(" + ")
      : "قص شعر بالمقص + تحديد دقن";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 1 — شريط الرأس الخاص بالتقييم */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          type="button"
          onClick={handleSkip}
          className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted cursor-pointer"
          aria-label="إلغاء التقييم والرجوع"
        >
          <X className="size-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground md:text-xl">
          قيّم زيارتك
        </h1>
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          بعدين
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* العمود الجانبي (على الديسكتوب): كارت معلومات الحجز */}
        <aside className="lg:col-span-5">
          <div className="sticky top-20 flex flex-col gap-4 rounded-[14px] border border-border bg-card p-5 shadow-xs">
            <div className="flex items-start gap-3.5 pb-4 border-b border-border/80">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                {salonImage ? (
                  <Image
                    src={salonImage}
                    alt={shopName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <Store className="size-6" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 min-w-0 flex-col gap-1">
                <span className="text-[15px] font-extrabold text-foreground truncate">
                  {shopName}
                </span>
                <span className="text-xs font-semibold text-muted-foreground truncate">
                  {servicesText} · {barberName}
                </span>
                <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <span>{formatBookingDetailDate(booking.startAt)} {formatTime(booking.startAt)}</span>
                  <span className="size-1 rounded-full bg-border" />
                  <span className="font-extrabold text-foreground tabular">
                    {formatPrice(booking.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-tint/60 p-3.5 text-start">
              <span className="text-xs font-bold text-primary-pressed leading-relaxed block">
                ⭐ رأيك بيساعد زباين تانية تختار صح، وبيكشف دقة وقت الطابور للجميع.
              </span>
            </div>
          </div>
        </aside>

        {/* العمود الرئيسي: نموذج التقييم التفصيلي */}
        <main className="flex flex-col gap-5 lg:col-span-7">
          {/* كارت 1: التقييم الإجمالي بالنجوم الكبيرة */}
          <div className="flex flex-col items-center justify-center rounded-[14px] border border-border bg-card p-6 text-center shadow-xs">
            <span className="text-base font-bold text-foreground mb-3">
              إيه رأيك في الخدمة؟
            </span>
            <div className="flex items-center justify-center gap-2 direction-ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label={`${star} من 5 نجوم`}
                >
                  <Star
                    className={cn(
                      "size-9 sm:size-10 transition-colors",
                      star <= overallRating
                        ? "fill-[#F59E0B] text-[#F59E0B]"
                        : "fill-border text-border"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="mt-3 text-sm font-extrabold text-primary">
              {RATING_LABELS[overallRating] || "اختر تقييمك"}
            </span>
          </div>

          {/* كارت 2: تقييم المعايير التفصيلية */}
          <div className="flex flex-col rounded-[14px] border border-border bg-card p-5 shadow-xs divide-y divide-border/70">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-3">
              قيّم التفاصيل
            </span>

            {/* جودة القصة */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm font-semibold text-foreground">
                جودة القصة
              </span>
              <div className="flex items-center gap-1.5 direction-ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setHaircutRating(star)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "size-5",
                        star <= haircutRating
                          ? "fill-[#F59E0B] text-[#F59E0B]"
                          : "fill-border text-border"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* نظافة المكان */}
            <div className="flex items-center justify-between py-3.5">
              <span className="text-sm font-semibold text-foreground">
                نظافة المكان
              </span>
              <div className="flex items-center gap-1.5 direction-ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCleanlinessRating(star)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "size-5",
                        star <= cleanlinessRating
                          ? "fill-[#F59E0B] text-[#F59E0B]"
                          : "fill-border text-border"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* دقة الوقت المتوقع */}
            <div className="flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  دقة الوقت المتوقع
                </span>
                <span className="text-xs text-muted-foreground">
                  التطبيق قال 20 د واستنيت 25 د تقريباً
                </span>
              </div>
              <div className="flex items-center gap-1.5 direction-ltr pt-1 sm:pt-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setPunctualityRating(star)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "size-5",
                        star <= punctualityRating
                          ? "fill-[#F59E0B] text-[#F59E0B]"
                          : "fill-border text-border"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* كارت 3: الوسوم السريعة للإشادة */}
          <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5 shadow-xs">
            <span className="text-sm font-bold text-foreground">
              إيه اللي عجبك؟ <span className="font-normal text-muted-foreground">(اختياري)</span>
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {COMPLIMENT_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {isSelected && <Check className="size-3.5 stroke-[2.5]" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* كارت 4: الملاحظات، الصورة، والاسم المستعار */}
          <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-5 shadow-xs">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="comment" className="text-sm font-bold text-foreground">
                تحب تضيف كلمة؟ <span className="font-normal text-muted-foreground">(اختياري)</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب رأيك عشان تساعد اللي بعدك…"
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-muted/40 p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>

            {/* رفع صورة للقصة */}
            <div className="flex flex-col gap-2">
              <label className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted cursor-pointer sm:w-auto self-start">
                <Camera className="size-4 text-muted-foreground" />
                <span>{uploadedPhoto ? "تغيير صورة القصة" : "ضيف صورة للقصة"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
              </label>
              {uploadedPhoto && (
                <div className="relative mt-1 size-20 overflow-hidden rounded-xl border border-border">
                  <Image
                    src={uploadedPhoto}
                    alt="صورة القصة"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadedPhoto(null)}
                    className="absolute top-1 end-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}
            </div>

            {/* النشر باسم مستعار */}
            <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="size-4.5 rounded-[5px] border-border text-primary accent-primary focus:ring-primary/20"
              />
              <span className="text-xs font-semibold text-muted-foreground">
                انشر التقييم باسم مستعار
              </span>
            </label>
          </div>

          {/* زر الإرسال النهائي */}
          <div className="pt-2 pb-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl text-base font-extrabold shadow-sm cursor-pointer"
            >
              {isSubmitting ? "جاري الإرسال…" : "ابعت التقييم"}
            </Button>
          </div>
        </main>
      </div>
    </form>
  );
}

