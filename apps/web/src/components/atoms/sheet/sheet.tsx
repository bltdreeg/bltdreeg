// شيت سفلي للموبايل، كارت في المنتصف على الشاشات الواسعة
import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn.utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

function SheetContent({ title, className, children, ...props }: Dialog.Popup.Props & { title: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <Dialog.Popup
        data-slot="sheet"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-6 shadow-lg transition-transform data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
          "sm:inset-auto sm:start-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:data-[ending-style]:translate-y-[-45%] sm:data-[starting-style]:translate-y-[-45%] rtl:sm:translate-x-1/2",
          className,
        )}
        {...props}
      >
        <div className="mb-4 flex items-center justify-between">
          <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
          <Dialog.Close aria-label="إغلاق" className="rounded-full p-1 hover:bg-muted">
            <XIcon className="size-5" />
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetTrigger };
