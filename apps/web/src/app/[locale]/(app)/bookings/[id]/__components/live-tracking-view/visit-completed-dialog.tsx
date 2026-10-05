"use client";

// نافذة حوار: نعيماً! قيّم تجربتك معانا — تظهر عند انتهاء الحلاقة
import { Dialog } from "@base-ui/react/dialog";
import { Check, Star, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ROUTE_BOOKING_RATE } from "@/lib/data/constants/routes.constants";

interface VisitCompletedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopName?: string;
  bookingId: string;
}

export function VisitCompletedDialog({
  open,
  onOpenChange,
  shopName = "صالون بربر لاونج",
  bookingId,
}: VisitCompletedDialogProps) {
  const t = useTranslations("app.liveTracking.visitCompletedDialog");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs transition-opacity" />
        <Dialog.Popup
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl text-center font-sans"
        >
          {/* زر الإغلاق العلوي */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 left-4 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label={t("close")}
          >
            <X className="size-4" />
          </button>

          {/* أيقونة النجاح والاحتفال */}
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-[#E7F4EA]">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#16A34A] shadow-md text-white">
              <Check className="size-8 stroke-[3]" />
            </div>
          </div>

          {/* العنوان */}
          <Dialog.Title className="text-2xl sm:text-3xl font-black text-foreground">
            {t("title")}
          </Dialog.Title>

          {/* الوصف */}
          <Dialog.Description className="mt-2 text-xs sm:text-sm font-semibold text-muted-foreground leading-relaxed px-1">
            {t("description", { shopName })}
          </Dialog.Description>

          {/* أزرار الإجراءات */}
          <div className="mt-6 flex flex-col gap-2.5">
            {/* زر قيّم تجربتك الآن — ينقل لصفحة التقييم */}
            <Link
              href={ROUTE_BOOKING_RATE(bookingId)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] text-sm sm:text-base font-extrabold text-white shadow-md hover:bg-[#0B5A54] active:scale-98 transition-all cursor-pointer"
            >
              <Star className="size-4 fill-white text-white" />
              <span>{t("rateNow")}</span>
            </Link>

            {/* زر لاحقاً */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card text-xs sm:text-sm font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {t("later")}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

