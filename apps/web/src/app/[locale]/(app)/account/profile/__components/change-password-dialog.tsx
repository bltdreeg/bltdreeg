"use client";

// تغيير كلمة السر (أو إضافتها لحساب اجتماعي/OTP من غير كلمة سر)
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Modal, ModalContent } from "@/components/atoms/modal";
import { useToast } from "@/components/atoms/toast";
import { useUpdatePassword } from "@/lib/hooks/user";
import { apiFieldErrors, authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import { checkPasswordCriteria } from "@/lib/utils/auth-validation.utils";

type ChangePasswordDialogProps = {
  hasPassword: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const INPUT_CLASS = "h-11 rounded-xl text-sm";

export function ChangePasswordDialog({ hasPassword, open, onOpenChange }: ChangePasswordDialogProps) {
  const t = useTranslations("app.account.profile.passwordModal");
  const { toast } = useToast();
  const update = useUpdatePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const serverFieldErrors = update.error ? apiFieldErrors(update.error) : {};

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
      setClientError(null);
      update.reset();
    }
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkPasswordCriteria(password).isValid) return setClientError(t("invalid"));
    if (password !== confirmation) return setClientError(t("mismatch"));
    setClientError(null);
    update.mutate(
      {
        currentPassword: hasPassword ? currentPassword : undefined,
        password,
        passwordConfirmation: confirmation,
      },
      {
        onSuccess: () => {
          toast.success(t("successTitle"), t("successDesc"));
          handleOpenChange(false);
        },
      },
    );
  }

  const error = clientError ?? (update.error && authErrorMessage(update.error));

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent
        title={hasPassword ? t("titleChange") : t("titleSet")}
        description={t("desc")}
        className="max-w-md text-start"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {hasPassword && (
            <label className="flex flex-col gap-1.5 text-xs font-bold text-foreground">
              {t("current")}
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-invalid={!!serverFieldErrors.current_password}
                className={INPUT_CLASS}
              />
            </label>
          )}
          <label className="flex flex-col gap-1.5 text-xs font-bold text-foreground">
            {t("new")}
            <Input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!serverFieldErrors.password}
              className={INPUT_CLASS}
            />
            <span className="text-[11px] font-normal text-muted-foreground">{t("hint")}</span>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-bold text-foreground">
            {t("confirm")}
            <Input
              type="password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className={INPUT_CLASS}
            />
          </label>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={update.isPending} className="h-10 flex-1 text-xs font-bold">
              {update.isPending ? t("saving") : t("submit")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="h-10 text-xs font-bold"
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
