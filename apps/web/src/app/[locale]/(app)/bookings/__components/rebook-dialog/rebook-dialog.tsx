// حوار إعادة نفس الحجز — مطابق لتصميم DIALOG FRAME 10D2 في web app design.html
"use client";

import { Modal, ModalContent } from "@/components/atoms/modal";
import { Button } from "@/components/atoms/button";
import { useRouter } from "@/i18n/navigation";
import { ROUTE_BOOK_SLOT } from "@/lib/data/constants/routes.constants";
import type { Booking } from "@/lib/types/booking";

interface RebookDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RebookDialog({
  booking,
  open,
  onOpenChange,
}: RebookDialogProps) {
  const router = useRouter();

  const handleConfirmRebook = () => {
    if (!booking) return;
    onOpenChange(false);

    const query = new URLSearchParams();
    if (booking.serviceIds?.length) {
      booking.serviceIds.forEach((id) => query.append("services", id));
    }
    if (booking.barberId && booking.barberId !== "any") {
      query.set("barberId", booking.barberId);
    }

    const slotUrl = `${ROUTE_BOOK_SLOT(booking.shopId)}${
      query.toString() ? `?${query.toString()}` : ""
    }`;

    router.push(slotUrl);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        showCloseButton={false}
        className="max-w-[480px] p-0 overflow-hidden border-border"
      >
        <div className="flex flex-col gap-2.5 p-6 pb-0 text-start">
          <h2 className="text-[21px] font-extrabold leading-[1.3] text-foreground">
            نعيد نفس الحجز؟
          </h2>
          <p className="text-sm leading-[1.8] text-muted-foreground text-pretty">
            هنفتحلك صفحة الحجز وكل اختياراتك السابقة جاهزة — بس هتختار الميعاد من
            الأوقات المتاحة.
          </p>
        </div>

        <div className="flex items-center gap-2.5 p-6 pt-5">
          <Button
            type="button"
            onClick={handleConfirmRebook}
            className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-primary text-[15px] font-bold text-primary-foreground hover:bg-primary-pressed whitespace-nowrap"
          >
            اختار الميعاد
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-12 shrink-0 px-5 text-[15px] font-bold text-primary hover:bg-primary/10 whitespace-nowrap"
          >
            مش دلوقتي
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}

