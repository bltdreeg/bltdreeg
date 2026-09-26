"use client";

// حوار تأكيد إلغاء الحجز — مطابق لتصميم DIALOG FRAME 10D1 في web app design.html
import { useState, useTransition } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cancelBooking } from "@/lib/actions/bookings/bookings.action";

interface CancelBookingDialogProps {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled?: () => void;
}

export function CancelBookingDialog({
  bookingId,
  open,
  onOpenChange,
  onCancelled,
}: CancelBookingDialogProps) {
  const t = useTranslations("app.bookings.cancelDialog");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConfirmCancel = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await cancelBooking(bookingId);
        if (res.success) {
          onOpenChange(false);
          onCancelled?.();
        } else {
          setError(res.message || t("errorDefault"));
        }
      } catch {
        setError(t("errorNetwork"));
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-card shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition-all data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 font-sans border border-border"
        >
          <div className="flex flex-col gap-2.5 p-6 pb-0">
            <Dialog.Title className="text-[21px] font-extrabold leading-[1.3] text-foreground">
              {t("title")}
            </Dialog.Title>
            <Dialog.Description className="text-sm leading-[1.8] text-muted-foreground">
              {t("description")}
            </Dialog.Description>
            {error && (
              <div className="rounded-lg bg-destructive/10 p-2 text-xs font-semibold text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-2.5 p-6 pt-5">
            <button
              type="button"
              disabled={isPending}
              onClick={handleConfirmCancel}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-destructive text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("cancelling")}</span>
                </span>
              ) : (
                t("confirm")
              )}
            </button>
            <Dialog.Close
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] border border-border bg-card text-[15px] font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
            >
              {t("keep")}
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>

  );
}

