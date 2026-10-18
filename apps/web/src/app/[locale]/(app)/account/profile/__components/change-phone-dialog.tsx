"use client";

// تغيير/إضافة رقم الموبايل على خطوتين: الرقم الجديد ← كود التأكيد
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Modal, ModalContent } from "@/components/atoms/modal";
import { useToast } from "@/components/atoms/toast";
import { useSendPhoneChangeOtp, useVerifyPhoneChange } from "@/lib/hooks/user";
import type { OtpChallenge } from "@/lib/types/auth";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import {
  DEFAULT_OTP_LENGTH,
  formatLocalEgyptianPhone,
  isValidOtp,
  validateEgyptianPhone,
} from "@/lib/utils/auth-validation.utils";

type ChangePhoneDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePhoneDialog({ open, onOpenChange }: ChangePhoneDialogProps) {
  const t = useTranslations("app.account.profile.changePhoneModal");
  const { toast } = useToast();
  const sendOtp = useSendPhoneChangeOtp();
  const verify = useVerifyPhoneChange();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<{ phone: string; otp: OtpChallenge } | null>(null);
  const [code, setCode] = useState("");

  const codeLength = challenge?.otp.codeLength ?? DEFAULT_OTP_LENGTH;
  const error = challenge ? verify.error ?? sendOtp.error : sendOtp.error;

  function reset() {
    setPhone("");
    setPhoneError(null);
    setChallenge(null);
    setCode("");
    sendOtp.reset();
    verify.reset();
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function send(e164: string) {
    sendOtp.mutate({ phone: e164 }, { onSuccess: (otp) => setChallenge({ phone: e164, otp }) });
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const result = validateEgyptianPhone(phone);
    if (!result.isValid || !result.e164) {
      setPhoneError(result.errorMessage ?? null);
      return;
    }
    setPhoneError(null);
    send(result.e164);
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!challenge || !isValidOtp(code, codeLength)) return;
    verify.mutate(
      { phone: challenge.phone, code },
      {
        onSuccess: () => {
          toast.success(t("successTitle"), formatLocalEgyptianPhone(challenge.phone));
          handleOpenChange(false);
        },
      },
    );
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent
        title={challenge ? t("codeTitle") : t("title")}
        description={
          challenge
            ? t("codeDesc", { length: codeLength, phone: formatLocalEgyptianPhone(challenge.phone) })
            : t("desc")
        }
        className="max-w-md text-start"
      >
        {!challenge ? (
          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <Input
              type="tel"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              placeholder="010xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={!!phoneError}
              className="h-11 rounded-xl text-start font-mono text-sm font-bold"
            />
            {(phoneError || error) && (
              <p role="alert" className="text-xs text-destructive">
                {phoneError ?? (error && authErrorMessage(error))}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={sendOtp.isPending} className="h-10 flex-1 text-xs font-bold">
                {sendOtp.isPending ? t("sending") : t("submit")}
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
        ) : (
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
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setChallenge(null)}
                className="cursor-pointer font-bold text-muted-foreground hover:underline"
              >
                {t("back")}
              </button>
              <button
                type="button"
                onClick={() => send(challenge.phone)}
                disabled={sendOtp.isPending}
                className="cursor-pointer font-bold text-primary hover:underline disabled:opacity-60"
              >
                {t("resend")}
              </button>
            </div>
            <Button
              type="submit"
              disabled={verify.isPending || !isValidOtp(code, codeLength)}
              className="h-10 text-xs font-bold"
            >
              {verify.isPending ? t("verifying") : t("verify")}
            </Button>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
