"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { MessageSquareText, CheckCircle2, AlertCircle, RefreshCw, Clock } from "lucide-react";
import {
  ROUTE_HOME,
  ROUTE_REGISTER,
} from "@/lib/data/constants/routes.constants";
import { DEMO_OTP, DEMO_OTP_MAX_ATTEMPTS } from "@/lib/data/constants/app.constants";
import { completeOtpLogin } from "@/lib/actions/auth/dev-login.action";
import { isValidOtp } from "@/lib/utils/auth-validation.utils";

interface OtpFormProps {
  phone?: string;
  callbackUrl?: string;
  onSuccess?: () => void;
}

export function OtpForm({ phone = "01023456789", callbackUrl, onSuccess }: OtpFormProps) {
  const t = useTranslations("auth.otp");
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(DEMO_OTP_MAX_ATTEMPTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(51);
  const [resendNotification, setResendNotification] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // عداد تنازلي لإعادة إرسال الكود
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  // التركيز على الخانة النشطة أول مرة
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const isComplete = digits.every((d) => d.length === 1);
  const formattedTimer = `00:${secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}`;
  const hasError = error !== null;

  // تنسيق رقم الهاتف ليظهر بمسافات كما في التصميم 0102 345 6789
  const displayPhone = phone.startsWith("1") ? `0${phone}` : phone;
  let formattedPhone = displayPhone;
  if (displayPhone.length === 11) {
    formattedPhone = displayPhone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  }

  function handleDigitChange(index: number, val: string) {
    setError(null);
    // قبول الأرقام فقط
    const sanitized = val.replace(/\D/g, "");
    if (!sanitized) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    const char = sanitized.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // نقل التركيز تلقائياً للخانة التالية
    if (index < 3) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // لو الخانة فاضية، ارجع للي قبلها وامسحها
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const nextDigits = [...digits];
        nextDigits[index] = "";
        setDigits(nextDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      // في وضع LTR، السهم الأيسر ينقل للخانة السابقة
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      // في وضع LTR، السهم الأيمن ينقل للخانة التالية
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 4; i++) {
      nextDigits[i] = pasted[i] || "";
    }
    setDigits(nextDigits);

    const focusIdx = Math.min(pasted.length, 3);
    setActiveIndex(focusIdx);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");

    if (!isValidOtp(code)) {
      setError(t("errors.invalidCode"));
      return;
    }

    // ponytail: تحقق ديمو زي الموبايل — الكود الصح 1234 و3 محاولات غلط بتقفل.
    if (code !== DEMO_OTP) {
      const left = attemptsLeft - 1;
      setAttemptsLeft(left);
      setDigits(["", "", "", ""]);
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
      setError(
        left > 0
          ? t("errors.attemptsLeft", { count: left })
          : t("errors.tooManyAttempts"),
      );
      return;
    }

    setIsSubmitting(true);
    await completeOtpLogin();
    setIsSubmitting(false);

    if (onSuccess) {
      onSuccess();
      return;
    }
    // refresh عشان الهيدر (Server Components) يقرا الكوكي الجديدة
    router.replace(callbackUrl || ROUTE_HOME);
    router.refresh();
  }

  function handleResend() {
    if (secondsRemaining > 0) return;
    setSecondsRemaining(51);
    setAttemptsLeft(DEMO_OTP_MAX_ATTEMPTS);
    setError(null);
    setDigits(["", "", "", ""]);
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
    setResendNotification(t("resendSuccess"));
    setTimeout(() => setResendNotification(null), 5000);
  }

  return (
    <div className="w-full max-w-[440px] flex flex-col items-start gap-4 text-start">
      {/* 1. أيقونة التوثيق */}
      <div className={`flex size-14 items-center justify-center rounded-2xl transition-colors ${
        hasError 
          ? "bg-[#FEF2F2] text-[#EF4444]" 
          : "bg-[#EAEFF0] text-[#0F766E]"
      }`}>
        <MessageSquareText className="size-6 stroke-[2]" />
      </div>

      {/* 2. الترويسة ورقم الهاتف مع رابط التغيير */}
      <div className="flex flex-col gap-2 mt-2 w-full">
        <h1 className="text-[28px] font-extrabold leading-tight text-[#0E0F11]">
          {hasError ? t("titleError") : t("titleDefault")}
        </h1>
        <div className="text-[14px] leading-relaxed text-[#6B7280]">
          {hasError ? (
            t("descriptionError")
          ) : (
            <>
              <div>{t("sentTo")}</div>
              <div className="flex items-center gap-2 mt-1">
                <Link
                  href={ROUTE_REGISTER}
                  className="font-bold text-[#0F766E] hover:underline"
                >
                  {t("changeNumber")}
                </Link>
                <span
                  dir="ltr"
                  className="font-bold tabular-nums text-[#0E0F11]"
                >
                  {formattedPhone}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* إشعار إرسال كود جديد */}
      {resendNotification && (
        <div className="w-full flex items-center gap-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-2.5 text-[13px] font-medium text-[#15803D] mt-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{resendNotification}</span>
        </div>
      )}

      {/* 3. الخانات الأربع لكود التأكيد */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 mt-2">
        <div
          dir="ltr"
          onPaste={handlePaste}
          className="flex justify-center gap-3 w-full"
        >
          {digits.map((digit, idx) => {
            const isCurrent = activeIndex === idx;
            const hasVal = digit !== "";

            return (
              <div
                key={idx}
                className={`relative flex flex-1 max-w-[72px] h-[72px] items-center justify-center rounded-2xl transition-all ${
                  hasError
                    ? "border-[1.5px] border-[#EF4444] bg-white ring-2 ring-[#FEF2F2]"
                    : isCurrent
                      ? "border-[1.5px] border-[#0F766E] bg-white"
                      : hasVal
                        ? "border border-[#E5E7EB] bg-white"
                        : "border border-[#E5E7EB] bg-[#F9FAFB]"
                }`}
              >
                <input
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onFocus={() => setActiveIndex(idx)}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  aria-label={t("digitAriaLabel", { index: idx + 1 })}
                  className="size-full bg-transparent text-center font-cairo text-2xl font-extrabold tabular-nums text-[#0E0F11] focus:outline-none"
                />
                {/* خط الكاريت المتحرك عند الخانة الفارغة النشطة */}
                {isCurrent && !hasVal && !hasError && (
                  <div className="pointer-events-none absolute h-6 w-0.5 animate-pulse bg-[#0F766E]" />
                )}
              </div>
            );
          })}
        </div>

        {/* 4. العداد التنازلي */}
        <div className="w-full flex items-center justify-center gap-1.5 text-[13.5px] font-medium text-[#6B7280]">
          {secondsRemaining > 0 ? (
            <>
              <Clock className="size-4" />
              <span>
                {t("resendIn", { timer: formattedTimer })}
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="flex items-center gap-1.5 font-bold text-[#0F766E] hover:underline cursor-pointer"
            >
              <RefreshCw className="size-4" />
              {t("resend")}
            </button>
          )}
        </div>

        {/* 5. زر التأكيد ورسالة المساعدة */}
        <div className="w-full flex flex-col gap-4">
          <button
            type="submit"
            disabled={!isComplete || isSubmitting}
            className="h-[52px] w-full rounded-xl text-[16px] font-bold shadow-xs transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:bg-[#EAEFF0] disabled:text-[#A5ABB3] bg-[#0F766E] text-white hover:bg-[#0B5A54]"
          >
            {isSubmitting ? t("submitPending") : t("submit")}
          </button>

          <div className="w-full flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white p-4 text-start text-[#6B7280]">
            <AlertCircle className="size-5 shrink-0" />
            <span className="text-[13px] font-medium leading-relaxed">
              {t("helpText")}
            </span>
          </div>
        </div>

      </form>
    </div>
  );
}
