// نافذة تأكيد تسجيل الخروج مطابقة لتصميم الموبايل (Frame 17)
"use client";

import { useState } from "react";
import { Modal, ModalContent } from "@/components/atoms/modal";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/actions/auth/auth.action";
import { SESSION_COOKIE } from "@/lib/data/constants/app.constants";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";

type LogoutDialogProps = {
  userName?: string;
  salonName?: string;
  activeBookingNotice?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function LogoutDialog({
  salonName = "صالون الكابتن حسام",
  activeBookingNotice,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: LogoutDialogProps) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

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
    setIsPending(true);
    try {
      await logout();
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    }
    setOpen(false);
    setIsPending(false);
    router.push(ROUTE_HOME);
    router.refresh();
  };

  const noticeText =
    activeBookingNotice ||
    `عندك دور شغّال في ${salonName}. لو خرجت مش هتوصلك إشعارات الدور، بس الدور نفسه هيفضل محجوز باسمك.`;

  return (
    <>
      {trigger && (
        <div onClick={() => setOpen(true)} className="contents cursor-pointer">
          {trigger}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent
          showCloseButton={false}
          className="w-[calc(100%-2.5rem)] max-w-[390px] rounded-[18px] border border-border/80 bg-card p-[24px_22px_18px] text-start shadow-[0_18px_44px_rgba(14,15,17,0.18)]"
        >
          {/* أيقونة الخروج الحمراء */}
          <div className="mb-4 flex size-[46px] items-center justify-center rounded-[12px] bg-[#FDEAEA] text-destructive">
            <svg
              className="size-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.5 4.5h-8v15h8" />
              <path d="M11 12h9.5M17.5 8.5 21 12l-3.5 3.5" />
            </svg>
          </div>

          {/* العنوان */}
          <h3 className="mb-2 text-[18px] font-extrabold text-foreground">
            تسجيل الخروج؟
          </h3>

          {/* نص التنبيه المبرر للأثر في الطابور */}
          <p className="mb-5 text-[14px] leading-[1.8] text-muted-foreground">
            {noticeText}
          </p>

          {/* أزرار الإجراءات الرأسية كما في تصميم الموبايل */}
          <div className="flex flex-col gap-[9px]">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-destructive text-[16px] font-bold text-destructive-foreground transition-colors hover:bg-destructive/90 active:bg-destructive/80 disabled:opacity-60"
            >
              {isPending ? "جاري الخروج..." : "اخرج من الحساب"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] border border-border bg-card text-[15px] font-bold text-foreground transition-colors hover:bg-muted active:bg-muted/80"
            >
              خليني فاضل
            </button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

