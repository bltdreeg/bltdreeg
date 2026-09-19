"use client";

// كارت "انت على الكرسي" — مطابق للمرحلة أثناء تلقي الخدمة
import { Navigation, Phone, Store, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils/format/price.utils";

interface InServiceQueueCardProps {
  shopName?: string;
  servicesText?: string;
  totalPrice?: number;
  salonPhone?: string;
  onFinishService: () => void;
}

export function InServiceQueueCard({
  shopName = "صالون بربر لاونج",
  servicesText = "قص شعر بالمقص + تحديد دقن",
  totalPrice = 180,
  salonPhone = "01012345678",
  onFinishService,
}: InServiceQueueCardProps) {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(shopName)}`;

  return (
    <div className="flex w-full flex-col items-center text-center gap-5 py-2">
      {/* 1. أيقونة كرسي الحلاقة */}
      <div className="relative flex size-20 sm:size-24 items-center justify-center rounded-full bg-[#E7F4EA]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#15803D"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-9 sm:size-10"
        >
          <path d="M6 3.5h3.5" />
          <path d="M7.75 3.5 8.6 12.5H17" />
          <path d="M9 8.5h5.5a1.5 1.5 0 0 1 1.5 1.5v2.5" />
          <path d="M17 12.5l2.5 4H16" />
          <path d="M12.5 12.5v6" />
          <path d="M8.5 20.5h8" />
        </svg>
      </div>

      {/* 2. العنوان ونصوص التهنئة */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">
          انت على الكرسي
        </h2>
        <p className="text-sm sm:text-base font-semibold text-muted-foreground max-w-sm">
          نعيماً مقدماً! أول ما تخلص هنطلب منك تقيّم زيارتك.
        </p>
      </div>

      {/* 3. كارت الصالون والخدمة */}
      <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 text-start shadow-xs">
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-border/70">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-base font-extrabold text-foreground truncate">
              {shopName}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {servicesText} · {formatPrice(totalPrice)}
            </span>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground">
            <Store className="size-5" />
          </div>
        </div>

        {/* أزرار الاتجاهات والاتصال */}
        <div className="grid grid-cols-2 gap-2.5 pt-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Navigation className="size-3.5" />
            <span>الاتجاهات</span>
          </a>
          <a
            href={`tel:${salonPhone}`}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Phone className="size-3.5" />
            <span>اتصل</span>
          </a>
        </div>
      </div>

      {/* 4. زر إنهاء الحلاقة (محاكاة انتهاء الخدمة) */}
      <div className="w-full pt-2">
        <button
          type="button"
          onClick={onFinishService}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] text-sm font-extrabold text-white shadow-md hover:bg-[#0B5A54] active:scale-98 transition-all cursor-pointer"
        >
          <span>خلصت الحلاقة (إنهاء الخدمة)</span>
          <Check className="size-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}

