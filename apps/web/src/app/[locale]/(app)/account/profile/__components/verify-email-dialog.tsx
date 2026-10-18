"use client";

// تأكيد البريد بالكود — السيرفر بيبعت الكود لوحده لما البريد يتغير، والزرار هنا بيعيد الإرسال
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Modal, ModalContent } from "@/components/atoms/modal";
import { useToast } from "@/components/atoms/toast";
import { useResendEmailCode, useVerifyEmail } from "@/lib/hooks/user";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import { DEFAULT_OTP_LENGTH, isValidOtp } from "@/lib/utils/auth-validation.utils";

type VerifyEmailDialogProps = {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function VerifyEmailDialog({ email, open, onOpenChange }: VerifyEmailDialogProps) {
  const t = useTranslations("app.account.profile.emailModal");
  const { toast } = useToast();
  const resend = useResendEmailCode();
  const verify = useVerifyEmail();
  const [code, setCode] = useState("");

  const codeLength = resend.data?.codeLength ?? DEFAULT_OTP_LENGTH;
  const error = verify.error ?? resend.error;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCode("");
      resend.reset();
      verify.reset();
    }
    onOpenChange(next);
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidOtp(code, codeLength)) return;
    verify.mutate(
      { code },
      {
        onSuccess: () => {
          toast.success(t("successTitle"), email);
          handleOpenChange(false);
        },
      },
    );
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent title={t("title")} description={t("desc", { email })} className="max-w-md text-start">
        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <Input
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={codeLength}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            aria-label={t("codeLabel")}
            className="h-11 rounded-xl text-center font-mono text-lg font-bold tracking-[0.4em]"
          />
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {authErrorMessage(error)}
            </p>
          )}
          {resend.isSuccess && <p className="text-xs text-muted-foreground">{t("resent")}</p>}
          <button
            type="button"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            className="cursor-pointer self-start text-xs font-bold text-primary hover:underline disabled:opacity-60"
          >
            {t("resend")}
          </button>
          <Button
            type="submit"
            disabled={verify.isPending || !isValidOtp(code, codeLength)}
            className="h-10 text-xs font-bold"
          >
            {verify.isPending ? t("verifying") : t("verify")}
          </Button>
        </form>
      </ModalContent>
    </Modal>
  );
}
