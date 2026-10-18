"use client";

// حوار تأكيد الإلغاء / الخروج من الطابور (DIALOG FRAME 10D1) — من غير غرامة قبل بداية الخدمة
import { Dialog } from "@base-ui/react/dialog";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCancelReservation } from "@/lib/hooks/reservations";
import type { ReservationStatus } from "@/lib/types/reservation";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";

interface CancelBookingDialogProps {
  reservationId: string;
  /** queued = خروج من الطابور، booked = إلغاء ميعاد الدخول */
  status: ReservationStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelBookingDialog({ reservationId, status, open, onOpenChange }: CancelBookingDialogProps) {
  const t = useTranslations("app.bookings.cancelDialog");
  const cancel = useCancelReservation();
  const inQueue = status === "queued";

  const handleOpenChange = (next: boolean) => {
    if (cancel.isPending) return;
    if (!next) cancel.reset();
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition-all data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="flex flex-col gap-2.5 p-6 pb-0">
            <Dialog.Title className="text-[21px] font-extrabold leading-[1.3] text-foreground">
              {inQueue ? t("leaveTitle") : t("title")}
            </Dialog.Title>
            <Dialog.Description className="text-sm leading-[1.8] text-muted-foreground">
              {inQueue ? t("leaveDescription") : t("slotDescription")}
            </Dialog.Description>
            {cancel.error && (
              <div role="alert" className="rounded-lg bg-destructive/10 p-2 text-xs font-semibold text-destructive">
                {authErrorMessage(cancel.error)}
              </div>
            )}
          </div>

          <div className="flex gap-2.5 p-6 pt-5">
            <button
              type="button"
              disabled={cancel.isPending}
              onClick={() => cancel.mutate(reservationId, { onSuccess: () => onOpenChange(false) })}
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-destructive text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {cancel.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("cancelling")}</span>
                </span>
              ) : inQueue ? (
                t("leaveConfirm")
              ) : (
                t("confirm")
              )}
            </button>
            <Dialog.Close
              disabled={cancel.isPending}
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
