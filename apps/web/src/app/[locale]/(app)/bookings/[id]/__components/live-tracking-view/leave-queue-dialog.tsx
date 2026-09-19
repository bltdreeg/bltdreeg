"use client";

// حوار تأكيد الخروج من الطابور — مطابق لشاشة الموبايل المرفقة
import { Dialog } from "@base-ui/react/dialog";
import { LogOut, Info } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { ROUTE_BOOKINGS } from "@/lib/data/constants/routes.constants";

interface LeaveQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueNumber?: number;
}

export function LeaveQueueDialog({
  open,
  onOpenChange,
  queueNumber = 2,
}: LeaveQueueDialogProps) {
  const router = useRouter();

  const handleConfirmLeave = () => {
    onOpenChange(false);
    router.push(ROUTE_BOOKINGS);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity" />
        <Dialog.Popup
          dir="rtl"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 shadow-2xl text-center font-sans"
        >
          {/* أيقونة الخروج الحمراء */}
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-50 text-[#EF4444]">
            <LogOut className="size-6 rtl:rotate-180" />
          </div>

          {/* العنوان */}
          <Dialog.Title className="text-xl font-black text-foreground">
            تطلع من الطابور؟
          </Dialog.Title>

          {/* الوصف */}
          <Dialog.Description className="mt-2 text-xs leading-relaxed text-muted-foreground">
            دورك رقم {queueNumber} هيروح لحد تاني ومش هينفع ترجعه. لو دخلت تاني هتبدأ من آخر الطابور.
          </Dialog.Description>

          {/* صندوق التحذير */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/60 p-3 text-start border border-border/50">
            <Info className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-[11.5px] font-semibold text-muted-foreground leading-relaxed">
              الخروج المتكرر من الطوابير بيقلّل تقييم الالتزام بتاعك.
            </span>
          </div>

          {/* أزرار الحوار */}
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleConfirmLeave}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#EF4444] text-sm font-extrabold text-white shadow-xs hover:bg-red-600 transition-colors cursor-pointer"
            >
              أيوه، اطلعني
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card text-sm font-extrabold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              خليني في الطابور
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

