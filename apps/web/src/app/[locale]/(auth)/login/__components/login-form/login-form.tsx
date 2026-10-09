"use client";

import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
import { afterAuthPath } from "@/lib/utils/auth/post-auth-redirect";
import { enterGuestMode } from "@/lib/utils/auth/guest-mode";
import { normalizeEgyptianPhone } from "@/lib/utils/auth-validation.utils";
import { SocialAuthButtons } from "../../../__components/social-auth-buttons";
import { createLoginSchema, type LoginFormValues, type LoginTab } from "./login-form.schema";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const t = useTranslations("auth.login");
  const tShared = useTranslations("auth.shared");
  const router = useRouter();
  const login = useLogin();
  const sendOtp = useSendLoginOtp();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema((key) => t(`errors.${key}`))),
    defaultValues: { tab: "email", email: "", phone: "", password: "" },
  });
  const tab = watch("tab");
  const [showPassword, setShowPassword] = useState(false);
  // بيانات غلط / حساب موقوف / كتر المحاولات: رسالة عامة فوق الزرار
  const [generalError, setGeneralError] = useState<string>();
  const isPending = login.isPending || sendOtp.isPending;

  const emailInputId = useId();
  const phoneInputId = useId();
  const passwordInputId = useId();

  function switchTab(next: LoginTab) {
    setValue("tab", next);
    clearErrors();
    setGeneralError(undefined);
  }

  function onValid(values: LoginFormValues) {
    setGeneralError(undefined);

    if (values.tab === "phone") {
      const normalizedPhone = normalizeEgyptianPhone(values.phone) ?? values.phone;

      // لو كلمة السر مكتوبة بندخل بيها، وإلا بنبعت كود التأكيد
      if (values.password) {
        login.mutate(
          { identifier: normalizedPhone, password: values.password },
          {
            onSuccess: (session) => router.replace(afterAuthPath(session.user, callbackUrl)),
            onError: (err) => setGeneralError(authErrorMessage(err)),
          },
        );
        return;
      }

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
          onError: (err) => setError("phone", { message: apiFieldErrors(err).phone ?? authErrorMessage(err) }),
        },
      );
      return;
    }

    login.mutate(
      { identifier: values.email, password: values.password },
      {
        onSuccess: (session) => router.replace(afterAuthPath(session.user, callbackUrl)),
        onError: (err) => setGeneralError(authErrorMessage(err)),
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
            {t("title")}
          </h1>
          <p className="text-sm leading-relaxed text-[#6B7280]">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleGuest}
          className="text-[13px] font-bold text-[#0F766E] hover:underline cursor-pointer whitespace-nowrap mt-2"
        >
          {t("browseAsGuest")}
        </button>
      </div>

      {/* 3. تبديل وضع الدخول: بريد إلكتروني أو موبايل */}
      <div
        role="tablist"
        aria-label={t("tabsAriaLabel")}
        className="flex rounded-[11px] border border-[#E5E7EB] bg-[#F7F8FA] p-1 gap-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "email"}
          onClick={() => switchTab("email")}
          className={`flex-1 h-9.5 rounded-lg text-[13.5px] transition-all flex items-center justify-center cursor-pointer ${
            tab === "email"
              ? "bg-white border border-[#E5E7EB] font-bold text-[#0E0F11] shadow-xs"
              : "font-semibold text-[#6B7280] hover:text-[#0E0F11]"
          }`}
        >
          {t("tabEmail")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "phone"}
          onClick={() => switchTab("phone")}
          className={`flex-1 h-9.5 rounded-lg text-[13.5px] transition-all flex items-center justify-center cursor-pointer ${
            tab === "phone"
              ? "bg-white border border-[#E5E7EB] font-bold text-[#0E0F11] shadow-xs"
              : "font-semibold text-[#6B7280] hover:text-[#0E0F11]"
          }`}
        >
          {t("tabPhone")}
        </button>
      </div>

      {/* 4. النموذج الفعلي */}
      <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
        {/* حقل الإيميل أو الموبايل */}
        {tab === "email" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={emailInputId}
                className="text-[13px] font-semibold text-[#0E0F11]"
              >
                {t("emailLabel")}
              </label>
              <input
                id={emailInputId}
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder="karim.mostafa@gmail.com"
                {...register("email")}
                className={`h-13 w-full rounded-xl bg-white px-3.5 text-[15px] text-[#0E0F11] transition-all placeholder:text-[#A5ABB3] focus:outline-none ${
                  errors.email
                    ? "border-[1.5px] border-[#EF4444] focus:ring-2 focus:ring-[#FEF2F2]"
                    : "border border-[#E5E7EB] focus:border-[#0F766E] focus:ring-2 focus:ring-[#F0FAF8]"
                }`}
              />
              {errors.email && (
                <span className="text-[12px] font-medium text-[#B91C1C]">
                  {errors.email?.message}
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
                  {t("passwordLabel")}
                </label>
                <Link
                  href={ROUTE_FORGOT_PASSWORD}
                  className="text-[12.5px] font-bold text-[#0F766E] hover:underline"
                >
                  {t("forgotPassword")}
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full bg-transparent text-[15px] text-[#0E0F11] placeholder:text-[#A5ABB3] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] text-[#6B7280] transition-colors hover:text-[#0E0F11] cursor-pointer"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[12px] font-medium text-[#B91C1C]">
                  {errors.password?.message}
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
              {t("phoneLabel")}
            </label>
            <div
              dir="ltr"
              className={`flex h-13 w-full items-center rounded-xl bg-white px-3.5 transition-all focus-within:ring-2 ${
                errors.phone
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
                type="tel"
                autoComplete="tel"
                placeholder="1xxxxxxxxx"
                {...register("phone")}
                className="w-full bg-transparent ps-2.5 text-[15px] tabular-nums text-[#0E0F11] placeholder:text-[#A5ABB3] focus:outline-none"
              />
            </div>
            {errors.phone && (
              <span className="text-[12px] font-medium text-[#B91C1C]">
                {errors.phone?.message}
              </span>
            )}
            <div className="mt-2 flex flex-col gap-1.5">
              <label htmlFor={passwordInputId} className="text-[13px] font-semibold text-[#0E0F11]">
                {t("passwordLabel")}
              </label>
              <input
                id={passwordInputId}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className="h-13 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-[15px] text-[#0E0F11] transition-all placeholder:text-[#A5ABB3] focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#F0FAF8]"
              />
              <span className="text-[12px] text-[#6B7280]">{t("phonePasswordHint")}</span>
            </div>
            <span className="text-[12px] text-[#0F766E] mt-1 font-medium flex items-center gap-1.5">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
               {tShared("confirmCodeHint")}
            </span>
          </div>
        )}

        {generalError && (
          <div role="alert" className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-[13px] font-medium text-[#B91C1C]">
            {generalError}
          </div>
        )}

        {/* زرار تسجيل الدخول أو إرسال OTP */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-1 flex h-[50px] w-full items-center justify-center rounded-xl bg-[#0F766E] text-[15.5px] font-bold text-white shadow-xs transition-colors hover:bg-[#0B5A54] disabled:cursor-not-allowed disabled:bg-[#E7EAEC] disabled:text-[#A5ABB3] cursor-pointer"
        >
          {isPending 
            ? (tab === "email" ? t("submitEmailPending") : t("submitPhonePending")) 
            : (tab === "email" ? t("submitEmail") : watch("password") ? t("submitPhoneWithPassword") : t("submitPhone"))}
        </button>
      </form>

      {/* 5. فاصل "أو" */}
      <div className="flex items-center gap-3 my-0.5">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-[12.5px] text-[#6B7280]">{t("or")}</span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      {/* 6. أزرار الدخول الاجتماعي */}
      <SocialAuthButtons prefix="simple" />

      {/* 7. إنشاء حساب */}
      <div className="flex flex-col gap-3 pt-3 border-t border-[#E5E7EB]">
        <div className="text-center text-[13.5px] text-[#6B7280]">
          {t("noAccount")}{" "}
          <Link
            href={ROUTE_REGISTER}
            className="font-bold text-[#0F766E] hover:underline"
          >
            {t("createOne")}
          </Link>
        </div>
      </div>
    </div>
  );
}
