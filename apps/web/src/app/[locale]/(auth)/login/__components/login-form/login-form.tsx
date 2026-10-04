"use client";

import { useState, useId } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  ROUTE_FORGOT_PASSWORD,
  ROUTE_HOME,
  ROUTE_REGISTER,
  ROUTE_VERIFY_OTP,
} from "@/lib/data/constants/routes.constants";
import { CALLBACK_PARAM } from "@/lib/data/constants/app.constants";
import { useLogin, useSendLoginOtp } from "@/lib/hooks/auth";
import { apiFieldErrors, authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import { enterGuestMode } from "@/lib/utils/auth/guest-mode";
import {
  isValidEmail,
  normalizeEgyptianPhone,
  validateEgyptianPhone,
} from "@/lib/utils/auth-validation.utils";
import { SocialAuthButtons } from "../../../__components/social-auth-buttons";
import type { LoginTab, LoginFormErrors } from "./login-form.schema";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const login = useLogin();
  const sendOtp = useSendLoginOtp();
  const [tab, setTab] = useState<LoginTab>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const isPending = login.isPending || sendOtp.isPending;

  const emailInputId = useId();
  const phoneInputId = useId();
  const passwordInputId = useId();

  function validate(): LoginFormErrors {
    const errs: LoginFormErrors = {};

    if (tab === "email") {
      if (!email.trim()) {
        errs.identifier = "اكتب البريد الإلكتروني";
      } else if (!isValidEmail(email)) {
        errs.identifier = "اكتب بريد إلكتروني صحيح (مثال: name@gmail.com).";
      }
      if (!password) {
        errs.password = "اكتب كلمة السر للمتابعة.";
      }
    } else {
      const phoneValidation = validateEgyptianPhone(phone);
      if (!phoneValidation.isValid) {
        errs.identifier = phoneValidation.errorMessage;
      }
    }

    return errs;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (tab === "phone") {
      const normalizedPhone = normalizeEgyptianPhone(phone) ?? phone;

      sendOtp.mutate(
        { phone: normalizedPhone },
        {
          onSuccess: () => {
            const params = new URLSearchParams({ phone: normalizedPhone, purpose: "login" });
            // بنمرّر وجهة الرجوع عشان اللي اتحوّل من صفحة محمية يرجعلها بعد التأكيد
            if (callbackUrl) params.set(CALLBACK_PARAM, callbackUrl);
            router.push(`${ROUTE_VERIFY_OTP}?${params.toString()}`);
          },
          // phone_not_registered وغيرها بتظهر تحت حقل الموبايل
          onError: (err) => setErrors({ identifier: apiFieldErrors(err).phone ?? authErrorMessage(err) }),
        },
      );
      return;
    }

    login.mutate(
      { identifier: email, password },
      {
        onSuccess: () => router.replace(callbackUrl || ROUTE_HOME),
        // بيانات غلط / حساب موقوف / كتر المحاولات: رسالة عامة فوق الزرار
        onError: (err) => setErrors({ general: authErrorMessage(err) }),
      },
    );
  }

  function handleGuest() {
    enterGuestMode();
    router.replace(ROUTE_HOME);
  }

  return (
    <div className="w-full max-w-[420px] flex flex-col gap-5">
      {/* 1. ترويسة النموذج وتصفح كزائر */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold leading-tight text-[#0E0F11]">
            أهلاً بيك تاني
          </h1>
          <p className="text-sm leading-relaxed text-[#6B7280]">
            سجّل دخول بحسابك عشان تتابع دورك وتحجز بلمستين.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGuest}
          className="text-[13px] font-bold text-[#0F766E] hover:underline cursor-pointer whitespace-nowrap mt-2"
        >
          تصفح كزائر
        </button>
      </div>

      {/* 3. تبديل وضع الدخول: بريد إلكتروني أو موبايل */}
      <div
        role="tablist"
        aria-label="طريقة تسجيل الدخول"
        className="flex rounded-[11px] border border-[#E5E7EB] bg-[#F7F8FA] p-1 gap-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "email"}
          onClick={() => {
            setTab("email");
            if (hasAttemptedSubmit) {
              setErrors((prev) => ({ ...prev, identifier: undefined }));
            }
          }}
          className={`flex-1 h-9.5 rounded-lg text-[13.5px] transition-all flex items-center justify-center cursor-pointer ${
            tab === "email"
              ? "bg-white border border-[#E5E7EB] font-bold text-[#0E0F11] shadow-xs"
              : "font-semibold text-[#6B7280] hover:text-[#0E0F11]"
          }`}
        >
          بريد إلكتروني
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "phone"}
          onClick={() => {
            setTab("phone");
            if (hasAttemptedSubmit) {
              setErrors((prev) => ({ ...prev, identifier: undefined }));
            }
          }}
          className={`flex-1 h-9.5 rounded-lg text-[13.5px] transition-all flex items-center justify-center cursor-pointer ${
            tab === "phone"
              ? "bg-white border border-[#E5E7EB] font-bold text-[#0E0F11] shadow-xs"
              : "font-semibold text-[#6B7280] hover:text-[#0E0F11]"
          }`}
        >
          رقم الموبايل
        </button>
      </div>

      {/* 4. النموذج الفعلي */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* حقل الإيميل أو الموبايل */}
        {tab === "email" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={emailInputId}
                className="text-[13px] font-semibold text-[#0E0F11]"
              >
                البريد الإلكتروني
              </label>
              <input
                id={emailInputId}
                name="email"
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

            {/* حقل كلمة السر للإيميل فقط */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={passwordInputId}
                  className="text-[13px] font-semibold text-[#0E0F11]"
                >
                  كلمة السر
                </label>
                <Link
                  href={ROUTE_FORGOT_PASSWORD}
                  className="text-[12.5px] font-bold text-[#0F766E] hover:underline"
                >
                  نسيت كلمة السر؟
                </Link>
              </div>
              <div
                className={`flex h-13 w-full items-center rounded-xl bg-white px-3.5 transition-all focus-within:ring-2 ${
                  errors.password
                    ? "border-[1.5px] border-[#EF4444] focus-within:ring-[#FEF2F2]"
                    : "border border-[#E5E7EB] focus-within:border-[#0F766E] focus-within:ring-[#F0FAF8]"
                }`}
              >
                <input
                  id={passwordInputId}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className="w-full bg-transparent text-[15px] text-[#0E0F11] placeholder:text-[#A5ABB3] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] text-[#6B7280] transition-colors hover:text-[#0E0F11] cursor-pointer"
                  aria-label={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[12px] font-medium text-[#B91C1C]">
                  {errors.password}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={phoneInputId}
              className="text-[13px] font-semibold text-[#0E0F11]"
            >
              رقم الموبايل
            </label>
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
                id={phoneInputId}
                name="phone"
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
            <span className="text-[12px] text-[#0F766E] mt-1 font-medium flex items-center gap-1.5">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
               هنبعتلك كود تأكيد على الرقم ده.
            </span>
          </div>
        )}

        {errors.general && (
          <div role="alert" className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-[13px] font-medium text-[#B91C1C]">
            {errors.general}
          </div>
        )}

        {/* زرار تسجيل الدخول أو إرسال OTP */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-1 flex h-[50px] w-full items-center justify-center rounded-xl bg-[#0F766E] text-[15.5px] font-bold text-white shadow-xs transition-colors hover:bg-[#0B5A54] disabled:cursor-not-allowed disabled:bg-[#E7EAEC] disabled:text-[#A5ABB3] cursor-pointer"
        >
          {isPending 
            ? (tab === "email" ? "جاري تسجيل الدخول..." : "جاري الإرسال...") 
            : (tab === "email" ? "سجّل دخول" : "إرسال كود التأكيد")}
        </button>
      </form>

      {/* 5. فاصل "أو" */}
      <div className="flex items-center gap-3 my-0.5">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-[12.5px] text-[#6B7280]">أو</span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      {/* 6. أزرار الدخول الاجتماعي */}
      <SocialAuthButtons prefix="simple" />

      {/* 7. إنشاء حساب */}
      <div className="flex flex-col gap-3 pt-3 border-t border-[#E5E7EB]">
        <div className="text-center text-[13.5px] text-[#6B7280]">
          لسه معندكش حساب؟{" "}
          <Link
            href={ROUTE_REGISTER}
            className="font-bold text-[#0F766E] hover:underline"
          >
            اعمل واحد دلوقتي
          </Link>
        </div>
      </div>
    </div>
  );
}
