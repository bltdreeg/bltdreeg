// نافذة تأكيد تسجيل الخروج مع تنبيه الحجز النشط في الدور
"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Modal, ModalContent } from "@/components/atoms/modal";
import { Button } from "@/components/atoms/button";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/actions/auth/auth.action";
import { SESSION_COOKIE } from "@/lib/data/constants/app.constants";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";

type LogoutDialogProps = {
  userName?: string;
  activeBookingNotice?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function LogoutDialog({
  userName = "كريم مصطفى",
  activeBookingNotice = "عندك ميعاد النهارده 6:30 م ورقمك في الدور 3 — فكّر تستنى لما تخلّصه.",
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: LogoutDialogProps) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(val);
    } else {
      setUncontrolledOpen(val);
    }
  };

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    }
    router.push(ROUTE_HOME);
    router.refresh();
  };

  return (
    <>
      {trigger && (
        <div onClick={() => setOpen(true)} className="contents cursor-pointer">
          {trigger}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent showCloseButton={false} className="p-0 overflow-hidden border-border max-w-[520px]">
          {/* رأس النافذة */}
          <div className="flex flex-col gap-2 px-6 pt-6 text-start">
            <h2 className="text-[21px] font-extrabold leading-tight text-foreground">
              تسجّل الخروج؟
            </h2>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              هتخرج من حساب {userName} على الجهاز ده.
            </p>
          </div>

          {/* محتوى الشرح والتنبيهات */}
          <div className="flex flex-col gap-3 px-6 pt-4 text-start">
            {/* نقطة خضراء */}
            <div className="flex items-start gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-success" />
              <span className="text-[13.5px] leading-relaxed text-foreground">
                تقدر تكمّل تتفرج على الصالونات والمواعيد من غير حساب.
              </span>
            </div>

            {/* نقطة رمادية */}
            <div className="flex items-start gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <span className="text-[13.5px] leading-relaxed text-foreground">
                حجوزاتك ورقمك في الدور محفوظين — بيرجعوا أول ما تسجّل دخول بنفس الرقم.
              </span>
            </div>

            {/* نقطة تحذير برتقالية */}
            <div className="flex items-start gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warning" />
              <span className="text-[13.5px] leading-relaxed text-foreground">
                بس مش هتوصلك تنبيهات الدور على الجهاز ده وانت خارج.
              </span>
            </div>

            {/* بوكس التنبيه لميعاد اليوم النشط في الطابور */}
            {activeBookingNotice && (
              <div className="mt-1 flex items-center gap-3 rounded-xl border border-border bg-muted/60 p-3.5">
                <div className="flex size-8.5 shrink-0 items-center justify-center rounded-[9px] border border-border bg-card">
                  <Clock className="size-4 text-primary" />
                </div>
                <p className="text-[13px] font-medium leading-relaxed text-foreground">
                  {activeBookingNotice}
                </p>
              </div>
            )}
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2.5 p-6 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="h-12 flex-1 rounded-xl border-destructive/60 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive text-[15px]"
            >
              أيوه، سجّل الخروج
            </Button>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="h-12 flex-1 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary-pressed text-[15px]"
            >
              خليني داخل
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

