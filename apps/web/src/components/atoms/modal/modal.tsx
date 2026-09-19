// نافذة منبثقة وسط الشاشة بأسلوب Base UI
"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn.utils";

const Modal = Dialog.Root;
const ModalTrigger = Dialog.Trigger;
const ModalClose = Dialog.Close;

function ModalContent({
  title,
  description,
  showCloseButton = true,
  className,
  children,
  ...props
}: Dialog.Popup.Props & {
  title?: string;
  description?: string;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <Dialog.Popup
        data-slot="modal"
        className={cn(
          "fixed start-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[520px] max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] outline-none transition-all duration-200",
          "data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          "rtl:translate-x-1/2",
          className
        )}
        {...props}
      >
        {(title || showCloseButton) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              {title && (
                <Dialog.Title className="text-xl font-extrabold text-foreground">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              )}
            </div>
            {showCloseButton && (
              <Dialog.Close
                aria-label="إغلاق"
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </Dialog.Close>
            )}
          </div>
        )}
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

export { Modal, ModalTrigger, ModalClose, ModalContent };

