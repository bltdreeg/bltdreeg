"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { MessageSquareText, CheckCircle2, AlertCircle, RefreshCw, Clock } from "lucide-react";
import {
  ROUTE_LOGIN,
  ROUTE_REGISTER,
} from "@/lib/data/constants/routes.constants";
import type { ApiError } from "@/lib/utils/api/api-error";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import { afterAuthPath } from "@/lib/utils/auth/post-auth-redirect";
import { useOtpChallenge, useResendOtp, useVerifyOtp } from "@/lib/hooks/auth";
import {
  DEFAULT_OTP_LENGTH,
  formatLocalEgyptianPhone,
  normalizeEgyptianPhone,
} from "@/lib/utils/auth-validation.utils";
import { createOtpSchema, type OtpFormValues } from "./otp-form.schema";

interface OtpFormProps {
  phone?: string;
  /** register: تأكيد حساب جديد، login: دخول بالكود */
  purpose?: "register" | "login";
  callbackUrl?: string;
  onSuccess?: () => void;
}

export function OtpForm({ phone = "", purpose = "login", callbackUrl, onSuccess }: OtpFormProps) {
  const t = useTranslations("auth.otp");
  const router = useRouter();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const { data: challenge } = useOtpChallenge(purpose, phone);
  const codeLength = challenge?.codeLength ?? DEFAULT_OTP_LENGTH;

  const { handleSubmit, setValue, clearErrors, formState } = useForm<OtpFormValues>({
    resolver: zodResolver(createOtpSchema(codeLength, t("errors.invalidCode"))),
    defaultValues: { code: "" },
  });

  const [digits, setDigitsState] = useState<string[]>(() => Array(codeLength).fill(""));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  // أخطاء السيرفر (كود غلط/منتهي/قفل) — أخطاء الشكل بتيجي من الفورم
  const [serverError, setServerError] = useState<string | null>(null);
  const error = serverError ?? formState.errors.code?.message ?? null;
  const [needsRestart, setNeedsRestart] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [resendNotification, setResendNotification] = useState<string | null>(null);
  const isSubmitting = verifyOtp.isPending;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // العداد التنازلي بيتحسب من وقت السيرفر (resend_available_at) مش من رقم ثابت
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // التركيز على الخانة النشطة أول مرة
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const slots = Array.from({ length: codeLength }, (_, i) => digits[i] ?? "");
  const resendAt = challenge ? Date.parse(challenge.resendAvailableAt) : 0;
  const secondsRemaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const isComplete = slots.every((d) => d.length === 1);
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTimer = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const hasError = error !== null;

  // تنسيق رقم الهاتف ليظهر بمسافات كما في التصميم 0102 345 6789
  const e164 = normalizeEgyptianPhone(phone) ?? phone;
  const displayPhone = formatLocalEgyptianPhone(phone);
  let formattedPhone = displayPhone;
  if (displayPhone.length === 11) {
    formattedPhone = displayPhone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  }

  // الخانات هي مصدر الحقل: أي تعديل بيتنقل لقيمة code في الفورم
  function setDigits(next: string[]) {
    setDigitsState(next);
    setValue("code", next.join(""));
    clearErrors("code");
  }

  function handleDigitChange(index: number, val: string) {
    setServerError(null);
    // قبول الأرقام فقط
    const sanitized = val.replace(/\D/g, "");
    if (!sanitized) {
      const nextDigits = [...slots];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    const char = sanitized.slice(-1);
    const nextDigits = [...slots];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // نقل التركيز تلقائياً للخانة التالية
    if (index < codeLength - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // لو الخانة فاضية، ارجع للي قبلها وامسحها
        const nextDigits = [...slots];
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const nextDigits = [...slots];
        nextDigits[index] = "";
        setDigits(nextDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      // في وضع LTR، السهم الأيسر ينقل للخانة السابقة
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < codeLength - 1) {
      // في وضع LTR، السهم الأيمن ينقل للخانة التالية
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, codeLength);
    if (!pasted) return;

    const nextDigits = [...slots];
    for (let i = 0; i < codeLength; i++) {
      nextDigits[i] = pasted[i] || "";
    }
    setDigits(nextDigits);

    const focusIdx = Math.min(pasted.length, codeLength - 1);
    setActiveIndex(focusIdx);
    inputRefs.current[focusIdx]?.focus();
  }

  function handleFailure(err: ApiError) {
    setServerError(authErrorMessage(err));
    // otp_expired = مفيش طلب مفتوح للرقم ده (اتمسح أو اتأكد قبل كده): الحل إنه يبدأ من الأول
    setNeedsRestart(err.code === "auth.otp_expired");
  }

  function resetDigits() {
    setDigits(Array(codeLength).fill(""));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  }

  function onValid({ code }: OtpFormValues) {
    setServerError(null);

    verifyOtp.mutate(
      { phone: e164, code, purpose },
      {
        onSuccess: (session) => {
          if (onSuccess) {
            onSuccess();
            return;
          }
          // حساب جديد أو ناقص بيروح للـ onboarding قبل أي صفحة تانية
          router.replace(afterAuthPath(session.user, callbackUrl, { isNewAccount: purpose === "register" }));
        },
        onError: (err) => {
          handleFailure(err);
          // الكود الغلط بيتمسح عشان يتكتب من جديد؛ باقي الأخطاء (قفل/انتهاء) الكود فيها زي ما هو
          if (err.code === "auth.otp_invalid") resetDigits();
        },
      },
    );
  }

  function handleResend() {
    if (secondsRemaining > 0 || resendOtp.isPending) return;
    resendOtp.mutate(
      { phone: e164, purpose },
      {
        onSuccess: (next) => {
          setServerError(null);
          resetDigits();
          setResendNotification(
            next.channel === "whatsapp" ? t("resendSuccessWhatsapp") : t("resendSuccess"),
          );
          setTimeout(() => setResendNotification(null), 5000);
        },
        onError: handleFailure,
      },
    );
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
            <>
              <div>{error}</div>
              {needsRestart && (
                <Link
                  href={purpose === "register" ? ROUTE_REGISTER : ROUTE_LOGIN}
                  className="mt-1 inline-block font-bold text-[#0F766E] hover:underline"
                >
                  {t("startOver")}
                </Link>
              )}
            </>
          ) : (
            <>
              <div>
                {t(challenge?.channel === "whatsapp" ? "sentToWhatsapp" : "sentToSms", { length: codeLength })}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Link
                  href={purpose === "register" ? ROUTE_REGISTER : ROUTE_LOGIN}
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
      <form onSubmit={(e) => void handleSubmit(onValid)(e)} className="w-full flex flex-col gap-6 mt-2">
        <div
          dir="ltr"
          onPaste={handlePaste}
          className="flex justify-center gap-3 w-full"
        >
          {slots.map((digit, idx) => {
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
                  className="size-full bg-transparent text-center font-cairo text-2xl font-extrabold tabular-nums text-[#0E0F11] caret-transparent focus:outline-none"
                />
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
              disabled={resendOtp.isPending}
              className="flex items-center gap-1.5 font-bold text-[#0F766E] hover:underline cursor-pointer"
            >
              <RefreshCw className="size-4" />
              {resendOtp.isPending ? t("resendPending") : t("resend")}
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
