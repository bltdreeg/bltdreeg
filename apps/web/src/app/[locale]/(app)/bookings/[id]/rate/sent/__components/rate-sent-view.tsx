"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Heart, Check, Store } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/atoms/button";
import { ROUTE_HOME, ROUTE_BOOKINGS } from "@/lib/data/constants/routes.constants";
import type { Booking } from "@/lib/types/booking";
import type { SalonDetails } from "@/lib/types/salon";

interface RateSentViewProps {
  booking: Booking;
  salon?: SalonDetails | null;
}

export function RateSentView({ booking, salon }: RateSentViewProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);

  const shopName = booking.shopName || salon?.name || "صالون الكابتن حسام";
  const salonImage =
    salon?.photos?.[0] || salon?.coverImage || "/images/salons/barber-lounge.webp";
  const userRating = booking.rating ?? 5;

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 max-w-lg mx-auto w-full text-center">
      {/* 1 — أيقونة النجاح الخضراء */}
      <div className="relative mb-5 flex size-24 items-center justify-center rounded-full bg-[#E7F4EA]">
        <div className="flex size-14 items-center justify-center rounded-full bg-[#16A34A] shadow-md">
          <Check className="size-8 stroke-[3] text-white" />
        </div>
      </div>

      {/* 2 — العنوان ورسالة الطمأنة */}
      <h1 className="text-2xl font-black text-foreground sm:text-3xl">
        شكراً — تقييمك اتبعت
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base max-w-md">
        رأيك هيساعد ناس تانية تختار صح، وهيظهر على صفحة الصالون خلال ساعة.
      </p>

      {/* 3 — كارت ملخص تقييمك */}
      <div className="mt-7 w-full rounded-2xl border border-border bg-card p-4.5 text-start shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
            {salonImage ? (
              <Image
                src={salonImage}
                alt={shopName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Store className="size-5" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <span className="text-[14.5px] font-extrabold text-foreground truncate">
              {shopName}
            </span>
            <div className="flex items-center gap-1.5 direction-ltr">
              <span className="text-xs font-bold text-muted-foreground mr-1.5 direction-rtl">
                تقييمك:
              </span>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-3.5 ${
                    star <= userRating
                      ? "fill-[#F59E0B] text-[#F59E0B]"
                      : "fill-border text-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 — كارت مقترح الإضافة للمفضلة (Frame 41) */}
      <div className="mt-4 w-full rounded-2xl bg-tint/80 border border-tint-border/70 p-4.5 text-start shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-[#EF4444] shadow-xs">
            <Heart className={`size-5 ${isFavorited ? "fill-[#EF4444]" : ""}`} />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-extrabold text-primary-pressed">
              تضيفه للمفضلة؟
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              هنقولك لما يبقى فاضي في وقتك المعتاد.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsFavorited(!isFavorited)}
          className={`mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            isFavorited
              ? "bg-[#16A34A] text-white"
              : "bg-card text-primary-pressed border border-border hover:bg-muted shadow-xs"
          }`}
        >
          {isFavorited ? (
            <>
              <Check className="size-3.5 stroke-[2.5]" />
              <span>مُضاف لمفضلاتك</span>
            </>
          ) : (
            <>
              <Heart className="size-3.5 text-[#EF4444]" />
              <span>ضيفه للمفضلة</span>
            </>
          )}
        </button>
      </div>

      {/* 5 — أزرار التنقل الرئيسية */}
      <div className="mt-6 flex w-full flex-col gap-3">
        <Button
          onClick={() => router.push(ROUTE_HOME)}
          className="h-12 w-full rounded-xl text-sm font-extrabold cursor-pointer"
        >
          تمام، ارجعني للرئيسية
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`${ROUTE_BOOKINGS}?tab=past`)}
          className="h-11 w-full rounded-xl text-sm font-bold border-border bg-card text-foreground hover:bg-muted cursor-pointer"
        >
          الرجوع لحجوزاتي السابقة
        </Button>
      </div>
    </div>
  );
}

