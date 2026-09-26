"use client";

// نموذج استعادة كلمة السر — متسق مع FRAME 13A و FRAME 13D
import { useState, useId } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowRight, KeyRound } from "lucide-react";
import {
  ROUTE_LOGIN,
  ROUTE_VERIFY_OTP,
} from "@/lib/data/constants/routes.constants";
import {
  isValidEmail,
  validateEgyptianPhone,
} from "@/lib/utils/auth-validation.utils";
import type {
  ResetIdentifierMode,
  ForgotPasswordFormErrors,
} from "./forgot-password-form.schema";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const router = useRouter();
  const [mode, setMode] = useState<ResetIdentifierMode>("phone");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailId = useId();
  const phoneId = useId();

  function validate(): ForgotPasswordFormErrors {
    const errs: ForgotPasswordFormErrors = {};

    if (mode === "email") {
      if (!email.trim()) {
        errs.identifier = t("errors.emailRequired");
      } else if (!isValidEmail(email)) {
        errs.identifier = t("errors.emailInvalid");
      }
    } else {
      const phoneValidation = validateEgyptianPhone(phone);
      if (!phoneValidation.isValid) {
        errs.identifier = phoneValidation.errorMessage;
      }
    }

    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const target = mode === "phone" ? phone.replace(/\D/g, "") : email;
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`${ROUTE_VERIFY_OTP}?mode=reset&target=${encodeURIComponent(target)}`);
    }, 600);
  }

  const hasErrors = hasAttemptedSubmit && Object.keys(errors).length > 0;

  return (
    <div className="w-full max-w-[420px] flex flex-col gap-5">
      {/* أيقونة المفتاح واستعادة الحساب */}
      <div className="flex size-14 items-center justify-center rounded-2xl border-[1.5px] border-[#CFE6E3] bg-[#F0FAF8] text-[#0F766E]">
        <KeyRound className="size-6 stroke-[2.2]" />
      </div>

      {/* ترويسة الصفحة */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-extrabold leading-tight text-[#0E0F11]">
          {t("title")}
        </h1>
        <p className="text-sm leading-relaxed text-[#6B7280]">
          {t("description")}
        </p>
      </div>

      {/* شريط الأخطاء (FRAME 13D) */}
      {hasErrors && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-[#0E0F11]"
        >
          <div className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#EF4444] text-[11px] font-black text-white">
            !
          </div>
          <span className="text-[13px] font-medium leading-relaxed">
            {t("errorBanner")}
          </span>
        </div>
      )}

      {/* تبديل طريقة الاستعادة */}
      <div
        role="tablist"
        aria-label={t("tabsAriaLabel")}
        className="flex rounded-[11px] border border-[#E5E7EB] bg-[#F7F8FA] p-1 gap-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "phone"}
          onClick={() => {
            setMode("phone");
            if (hasAttemptedSubmit) {
              setErrors((prev) => ({ ...prev, identifier: undefined }));
            }
          }}
          className={`flex-1 h-9.5 rounded-lg text-[13.5px] transition-all flex items-center justify-center cursor-pointer ${
            mode === "phone"
              ? "bg-white border border-[#E5E7EB] font-bold text-[#0E0F11] shadow-xs"
              : "font-semibold text-[#6B7280] hover:text-[#0E0F11]"
          }`}
        >
          {t("tabPhone")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "email"}
          onClick={() => {
            setMode("email");
            if (hasAttemptedSubmit) {
              setErrors((prev) => ({ ...prev, identifier: undefined }));
            }
          }}
          className={`flex-1 h-9.5 rounded-lg text-[13.5px] transition-all flex items-center justify-center cursor-pointer ${
            mode === "email"
              ? "bg-white border border-[#E5E7EB] font-bold text-[#0E0F11] shadow-xs"
              : "font-semibold text-[#6B7280] hover:text-[#0E0F11]"
          }`}
        >
          {t("tabEmail")}
        </button>
      </div>

      {/* النموذج الفعلي */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {mode === "phone" ? (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={phoneId}
              className="text-[13px] font-semibold text-[#0E0F11]"
            >
              {t("phoneLabel")}
            </label>
            {/* الصندوق كله LTR زي AppPhoneField في الموبايل: الكود على الشمال والرقم جنبه */}
            <div
              dir="ltr"
              className={`flex h-13 w-full items-center rounded-xl bg-white px-3.5 transition-all focus-within:ring-2 ${
                errors.identifier
                  ? "border-[1.5px] border-[#EF4444] focus-within:ring-[#FEF2F2]"
                  : "border border-[#E5E7EB] focus-within:border-[#0F766E] focus-within:ring-[#F0FAF8]"
              }`}
            >
              <span className="flex shrink-0 items-center gap-1.5 border-e border-[#E5E7EB] pe-2.5 text-[15px] font-bold tabular-nums text-[#6B7280]">
                +20
                <span aria-hidden>🇪🇬</span>
              </span>
              <input
                id={phoneId}
                type="tel"
                autoComplete="tel"
                placeholder="1xxxxxxxxx"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.identifier) {
                    setErrors((prev) => ({ ...prev, identifier: undefined }));
                  }
                }}
                className="w-full bg-transparent ps-2.5 text-[15px] tabular-nums text-[#0E0F11] placeholder:text-[#A5ABB3] focus:outline-none"
              />
            </div>
            {errors.identifier && (
              <span className="text-[12px] font-medium text-[#B91C1C]">
                {errors.identifier}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={emailId}
              className="text-[13px] font-semibold text-[#0E0F11]"
            >
              {t("emailLabel")}
            </label>
            <input
              id={emailId}
              type="email"
              dir="ltr"
              autoComplete="email"
              placeholder="karim.mostafa@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.identifier) {
                  setErrors((prev) => ({ ...prev, identifier: undefined }));
                }
              }}
              className={`h-13 w-full rounded-xl bg-white px-3.5 text-[15px] text-[#0E0F11] transition-all placeholder:text-[#A5ABB3] focus:outline-none ${
                errors.identifier
                  ? "border-[1.5px] border-[#EF4444] focus:ring-2 focus:ring-[#FEF2F2]"
                  : "border border-[#E5E7EB] focus:border-[#0F766E] focus:ring-2 focus:ring-[#F0FAF8]"
              }`}
            />
            {errors.identifier && (
              <span className="text-[12px] font-medium text-[#B91C1C]">
                {errors.identifier}
              </span>
            )}
          </div>
        )}

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex h-[50px] w-full items-center justify-center rounded-xl bg-[#0F766E] text-[15.5px] font-bold text-white shadow-xs transition-colors hover:bg-[#0B5A54] disabled:cursor-not-allowed disabled:bg-[#E7EAEC] disabled:text-[#A5ABB3] cursor-pointer"
        >
          {isSubmitting ? t("submitPending") : t("submit")}
        </button>

        {/* العودة لتسجيل الدخول */}
        <div className="flex justify-center pt-2">
          <Link
            href={ROUTE_LOGIN}
            className="flex items-center gap-1.5 text-sm font-bold text-[#0F766E] hover:underline"
          >
            <ArrowRight className="size-4 rtl:rotate-0 rotate-180" />
            <span>{t("backToLogin")}</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
