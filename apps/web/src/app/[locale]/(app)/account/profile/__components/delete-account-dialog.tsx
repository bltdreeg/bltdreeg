"use client";

// تأكيد حذف الحساب نهائياً — بعد الحذف الجلسة بتتمسح وبنرجع للرئيسية
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Modal, ModalContent } from "@/components/atoms/modal";
import { useRouter } from "@/i18n/navigation";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";
import { useDeleteAccount } from "@/lib/hooks/user";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";

type DeleteAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const t = useTranslations("app.account.profile.deleteModal");
  const router = useRouter();
  const remove = useDeleteAccount();

  function handleOpenChange(next: boolean) {
    if (remove.isPending) return;
    if (!next) remove.reset();
    onOpenChange(next);
  }

  function handleDelete() {
    remove.mutate(undefined, {
      onSuccess: () => {
        onOpenChange(false);
        router.push(ROUTE_HOME);
        router.refresh();
      },
    });
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent showCloseButton={false} className="max-w-md text-start">
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="text-lg font-extrabold text-foreground">{t("title")}</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("desc")}</p>
        {remove.error && (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {authErrorMessage(remove.error)}
          </p>
        )}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={remove.isPending}
            className="h-10 flex-1 cursor-pointer rounded-xl bg-destructive text-xs font-bold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-60"
          >
            {remove.isPending ? t("deleting") : t("confirm")}
          </button>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={remove.isPending}
            className="h-10 cursor-pointer rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted"
          >
            {t("cancel")}
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
}
