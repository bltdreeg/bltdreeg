"use client";

import { useState, useId } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Eye, EyeOff, Check } from "lucide-react";
import {
  ROUTE_LOGIN,
  ROUTE_VERIFY_OTP,
} from "@/lib/data/constants/routes.constants";
import { CALLBACK_PARAM } from "@/lib/data/constants/app.constants";
import { useRegister } from "@/lib/hooks/auth";
import { apiFieldErrors, authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import {
  checkPasswordCriteria,
  isValidEmail,
  normalizeEgyptianPhone,
  validateEgyptianPhone,
} from "@/lib/utils/auth-validation.utils";
import { SocialAuthButtons } from "../../../__components/social-auth-buttons";
import { PasswordRequirements } from "../password-requirements";
import type { RegisterFormErrors } from "./register-form.schema";

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const register = useRegister();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const isSubmitting = register.isPending;

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const passwordId = useId();

  // فحص شروط كلمة السر لحظياً
  const passwordCriteria = checkPasswordCriteria(password);

  function validate(): RegisterFormErrors {
    const errs: RegisterFormErrors = {};

    if (!firstName.trim()) {
      errs.firstName = "اكتب اسمك الأول.";
    }

    if (!lastName.trim()) {
      errs.lastName = "الصالون بيحتاج اسمك كامل عشان يناديك في الدور.";
    }

    if (email.trim() && !isValidEmail(email)) {
      errs.email = "اكتب بريد إلكتروني صحيح (مثال: name@gmail.com).";
    }

    const phoneValidation = validateEgyptianPhone(phone);
    if (!phoneValidation.isValid) {
      errs.phone = phoneValidation.errorMessage;
    }

    if (!passwordCriteria.isValid) {
      errs.password = "كلمة السر مش مستوفية كل الشروط.";
    }

    if (!agreeToTerms) {
      errs.agreeToTerms = "لازم توافق على الشروط وسياسة الخصوصية.";
    }

    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setPasswordTouched(true);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // الرقم الصحيح متوحّد بـ libphonenumber-js (+201XXXXXXXXX) سواء اتكتب بـ 0 أو 20 أو +20
    const normalizedPhone = normalizeEgyptianPhone(phone) ?? phone;

    register.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: normalizedPhone,
        email: email.trim() || undefined,
        password,
        acceptedTerms: agreeToTerms,
      },
      {
        onSuccess: () => {
          const params = new URLSearchParams({ phone: normalizedPhone, purpose: "register" });
          if (callbackUrl) params.set(CALLBACK_PARAM, callbackUrl);
          router.push(`${ROUTE_VERIFY_OTP}?${params.toString()}`);
        },
        onError: (err) => {
          // أخطاء السيرفر بتتوزع على الحقول (phone_taken، email_taken، قواعد كلمة السر...)
          const fields = apiFieldErrors(err);
          const next: RegisterFormErrors = {
            firstName: fields.first_name,
            lastName: fields.last_name,
            email: fields.email,
            phone: fields.phone,
            password: fields.password,
          };
          if (err.code === "auth.phone_taken") next.phone = err.message;
          if (err.code === "auth.email_taken") next.email = err.message;
          if (!Object.values(next).some(Boolean)) next.general = authErrorMessage(err);
          setErrors(next);
        },
      },
    );
  }

  return (
    <div className="w-full max-w-[440px] flex flex-col gap-4.5">
      {/* 1. ترويسة النموذج */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-extrabold leading-tight text-[#0E0F11]">
          اعمل حساب
        </h1>
        <p className="text-[13.5px] leading-relaxed text-[#6B7280]">
          دقيقة واحدة وتبقى جاهز تحجز.
        </p>
      </div>

      {/* 3. النموذج الفعلي */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        {/* صف الاسمين: الأول والعائلة */}
        <div className="flex gap-2.5">
          {/* الاسم الأول */}
          <div className="flex flex-1 flex-col gap-1.5">
            <label
              htmlFor={firstNameId}
              className="text-[12.5px] font-semibold text-[#0E0F11]"
            >
              الاسم الأول
            </label>
            <input
              id={firstNameId}
              type="text"
              autoComplete="given-name"
              placeholder="كريم"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) {
                  setErrors((prev) => ({ ...prev, firstName: undefined }));
                }
              }}
              className={`h-[46px] w-full rounded-xl bg-white px-3.5 text-[15px] text-[#0E0F11] transition-all placeholder:text-[#A5ABB3] focus:outline-none ${
                errors.firstName
                  ? "border-[1.5px] border-[#EF4444] focus:ring-2 focus:ring-[#FEF2F2]"
                  : "border border-[#E5E7EB] focus:border-[#0F766E] focus:ring-2 focus:ring-[#F0FAF8]"
              }`}
            />
            {errors.firstName && (
              <span className="text-[11.5px] font-medium text-[#B91C1C]">
                {errors.firstName}
              </span>
            )}
          </div>

          {/* اسم العائلة */}
          <div className="flex flex-1 flex-col gap-1.5">
            <label
              htmlFor={lastNameId}
              className="text-[12.5px] font-semibold text-[#0E0F11]"
            >
              اسم العائلة
            </label>
            <input
              id={lastNameId}
              type="text"
              autoComplete="family-name"
              placeholder="مصطفى"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errors.lastName) {
                  setErrors((prev) => ({ ...prev, lastName: undefined }));
                }
              }}
              className={`h-[46px] w-full rounded-xl bg-white px-3.5 text-[15px] text-[#0E0F11] transition-all placeholder:text-[#A5ABB3] focus:outline-none ${
                errors.lastName
                  ? "border-[1.5px] border-[#EF4444] focus:ring-2 focus:ring-[#FEF2F2]"
                  : "border border-[#E5E7EB] focus:border-[#0F766E] focus:ring-2 focus:ring-[#F0FAF8]"
              }`}
            />
            {errors.lastName && (
              <span className="text-[11.5px] font-medium leading-tight text-[#B91C1C]">
                {errors.lastName}
              </span>
            )}
          </div>
        </div>

        {/* البريد الإلكتروني (اختياري) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={emailId}
            className="text-[12.5px] font-semibold text-[#0E0F11] flex justify-between"
          >
            البريد الإلكتروني
            <span className="text-[#6B7280] font-normal">(اختياري)</span>
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
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            className={`h-[46px] w-full rounded-xl bg-white px-3.5 text-[15px] text-[#0E0F11] transition-all placeholder:text-[#A5ABB3] focus:outline-none ${
              errors.email
                ? "border-[1.5px] border-[#EF4444] focus:ring-2 focus:ring-[#FEF2F2]"
                : "border border-[#E5E7EB] focus:border-[#0F766E] focus:ring-2 focus:ring-[#F0FAF8]"
            }`}
          />
          {errors.email && (
            <span className="text-[12px] font-medium text-[#B91C1C]">
              {errors.email}
            </span>
          )}
        </div>

        {/* رقم الموبايل */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={phoneId}
            className="text-[12.5px] font-semibold text-[#0E0F11]"
          >
            رقم الموبايل
          </label>
          <div
            dir="ltr"
            className={`flex h-[46px] w-full items-center rounded-xl bg-white px-3.5 transition-all focus-within:ring-2 ${
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
              id={phoneId}
              type="tel"
              autoComplete="tel"
              placeholder="1xxxxxxxxx"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) {
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              className="w-full bg-transparent ps-2.5 text-[15px] tabular-nums text-[#0E0F11] placeholder:text-[#A5ABB3] focus:outline-none"
            />
          </div>
          {errors.phone ? (
            <span className="text-[12px] font-medium leading-relaxed text-[#B91C1C]">
              {errors.phone}
            </span>
          ) : (
            <span className="text-[12px] text-[#6B7280]">
              هنبعتلك كود تأكيد على الرقم ده.
            </span>
          )}
        </div>

        {/* كلمة السر وقائمة الشروط التفاعلية */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor={passwordId}
            className="text-[12.5px] font-semibold text-[#0E0F11]"
          >
            كلمة السر
          </label>
          <div
            className={`flex h-[46px] w-full items-center rounded-xl bg-white px-3.5 transition-all focus-within:ring-2 ${
              errors.password
                ? "border-[1.5px] border-[#EF4444] focus-within:ring-[#FEF2F2]"
                : "border border-[#E5E7EB] focus-within:border-[#0F766E] focus-within:ring-[#F0FAF8]"
            }`}
          >
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onFocus={() => setPasswordTouched(true)}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordTouched(true);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              className="w-full bg-transparent text-[15px] text-[#0E0F11] placeholder:text-[#A5ABB3] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] text-[#6B7280] transition-colors hover:text-[#0E0F11] cursor-pointer"
              aria-label={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
            >
              {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>

          {/* قائمة متطلبات كلمة السر الحية */}
          <PasswordRequirements
            criteria={passwordCriteria}
            touched={passwordTouched}
          />
        </div>

        {/* الموافقة على الشروط */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-start gap-2.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreeToTerms}
              onClick={() => {
                setAgreeToTerms((v) => !v);
                if (errors.agreeToTerms) {
                  setErrors((prev) => ({ ...prev, agreeToTerms: undefined }));
                }
              }}
              className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors cursor-pointer ${
                agreeToTerms
                  ? "border-[#0F766E] bg-[#0F766E] text-white"
                  : errors.agreeToTerms
                    ? "border-[#EF4444] bg-white"
                    : "border-[#CFD4DA] bg-white text-transparent"
              }`}
            >
              <Check className="size-3 stroke-[3]" />
            </button>
            <span
              onClick={() => setAgreeToTerms((v) => !v)}
              className="cursor-pointer select-none text-[13px] leading-[1.7] text-[#0E0F11]"
            >
              موافق على{" "}
              <Link href="/terms" className="font-bold underline">
                الشروط
              </Link>{" "}
              و
              <Link href="/privacy" className="font-bold underline">
                سياسة الخصوصية
              </Link>
              ، وإن الصالون يشوف اسمك ورقمك لما تحجز.
            </span>
          </div>
          {errors.agreeToTerms && (
            <span className="text-[12px] font-medium text-[#B91C1C]">
              {errors.agreeToTerms}
            </span>
          )}
        </div>

        {/* زرار إنشاء الحساب */}
        <div className="flex flex-col gap-2 pt-1">
          {errors.general && (
            <div role="alert" className="mb-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-[13px] font-medium text-[#B91C1C]">
              {errors.general}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-[50px] w-full items-center justify-center rounded-xl bg-[#0F766E] text-[15.5px] font-bold text-white shadow-xs transition-colors hover:bg-[#0B5A54] disabled:cursor-not-allowed disabled:bg-[#E7EAEC] disabled:text-[#A5ABB3] cursor-pointer"
          >
            {isSubmitting ? "جاري إنشاء الحساب..." : "اعمل الحساب"}
          </button>
        </div>
      </form>

      {/* 4. أزرار الدخول الاجتماعي */}
      <SocialAuthButtons prefix="continue" />

      {/* 5. الانتقال لتسجيل الدخول */}
      <div className="text-center text-[13.5px] text-[#6B7280] pt-1">
        عندك حساب بالفعل؟{" "}
        <Link
          href={ROUTE_LOGIN}
          className="font-bold text-[#0E0F11] hover:text-[#0F766E] hover:underline"
        >
          سجّل دخول
        </Link>
      </div>
    </div>
  );
}
