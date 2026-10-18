"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, KeyRound, MapPin, ShieldCheck, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { useUpdateProfile } from "@/lib/hooks/user";
import type { Customer } from "@/lib/types/auth";
import { apiFieldErrors, authErrorMessage } from "@/lib/utils/auth/auth-error-message";
import { formatLocalEgyptianPhone } from "@/lib/utils/auth-validation.utils";
import { customerFullName, customerInitials } from "@/lib/utils/user/customer-display";
import { toProfileValues, toUpdateProfileDto, type ProfileFormValues } from "@/lib/utils/user/profile-update";
import { ChangePasswordDialog } from "./change-password-dialog";
import { ChangePhoneDialog } from "./change-phone-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { createProfileSchema } from "./profile-form.schema";
import { VerifyEmailDialog } from "./verify-email-dialog";

interface ProfileFormProps {
  user: Customer;
}

// أسماء حقول Laravel ← أسماء حقول الفورم
const SERVER_FIELDS: Record<string, keyof ProfileFormValues> = {
  first_name: "firstName",
  last_name: "lastName",
  email: "email",
  birth_date: "birthDate",
};

const INPUT_CLASS =
  "h-11 rounded-xl border border-border bg-muted/40 px-3.5 text-sm font-semibold text-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15 aria-invalid:border-destructive";

export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations("app.account.profile");
  const update = useUpdateProfile();
  const [isSaved, setIsSaved] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const initial = toProfileValues(user);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(createProfileSchema((key) => t(`errors.${key}`))),
    // values بيعمل reset لما المستخدم يتحدّث في الكاش (بعد الحفظ أو تأكيد البريد)
    values: initial,
  });

  function onValid(values: ProfileFormValues) {
    const dto = toUpdateProfileDto(values, initial);
    if (Object.keys(dto).length === 0) return;
    setIsSaved(false);
    update.mutate(dto, {
      onSuccess: (saved) => {
        reset(toProfileValues(saved));
        setIsSaved(true);
        // البريد الجديد بيوصله كود تلقائياً، فبنفتح التأكيد على طول
        if (dto.email && saved.email && !saved.emailVerified) setEmailModalOpen(true);
      },
      onError: (error) => {
        for (const [field, message] of Object.entries(apiFieldErrors(error))) {
          const name = SERVER_FIELDS[field];
          if (name) setError(name, { message });
        }
      },
    });
  }

  const fullName = customerFullName(user);
  const formError =
    update.error && Object.keys(apiFieldErrors(update.error)).length === 0 ? authErrorMessage(update.error) : null;

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* العمود الجانبي: الحروف الأولى وبطاقة الأمان */}
        <aside className="flex flex-col gap-5 lg:col-span-4">
          <div className="flex flex-col items-center justify-center rounded-[14px] border border-border bg-card p-6 text-center shadow-xs">
            <div
              aria-hidden
              className="mb-3 flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-tint text-2xl font-black text-primary-pressed shadow-inner"
            >
              {customerInitials(user)}
            </div>
            {fullName && <h2 className="text-base font-extrabold text-foreground">{fullName}</h2>}
          </div>

          {/* بطاقة توثيق الهوية */}
          <div className="rounded-[14px] border border-border bg-muted/40 p-4.5 text-start">
            <div className="flex items-center gap-2 text-primary-pressed">
              <ShieldCheck className="size-4.5" />
              <span className="text-xs font-bold">{t("securityTitle")}</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{t("securityDesc")}</p>
          </div>
        </aside>

        {/* العمود الرئيسي: نموذج البيانات */}
        <main className="flex flex-col gap-5 lg:col-span-8">
          <div className="rounded-[14px] border border-border bg-card p-6 shadow-xs flex flex-col gap-4.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
              {t("basicInfo")}
            </h2>

            {/* الاسم الأول واسم العائلة */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label={t("firstName")} error={errors.firstName?.message}>
                <input
                  type="text"
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label={t("lastName")} error={errors.lastName?.message}>
                <input
                  type="text"
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  {...register("lastName")}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>

            {/* رقم الموبايل (بيتغير بكود تأكيد بس) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-foreground">{t("phone")}</span>
              <div className="flex h-11 items-center justify-between rounded-xl border border-border bg-muted/70 px-3.5">
                <span dir="ltr" className="font-mono text-sm font-bold text-foreground">
                  {user.phone ? formatLocalEgyptianPhone(user.phone) : t("notAdded")}
                </span>
                {user.phone && <StatusBadge verified={user.phoneVerified} label={user.phoneVerified ? t("verified") : t("unverified")} />}
              </div>
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <span className="text-muted-foreground">{t("phoneIdentity")}</span>
                <button
                  type="button"
                  onClick={() => setPhoneModalOpen(true)}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  {user.phone ? t("changePhone") : t("addPhone")}
                </button>
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <Field
              label={t("email")}
              optional={t("optional")}
              error={errors.email?.message}
              hint={t("emailHint")}
              badge={
                user.email && !isDirty ? (
                  <StatusBadge verified={user.emailVerified} label={user.emailVerified ? t("verified") : t("unverified")} />
                ) : null
              }
            >
              <input
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder="name@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
                className={`${INPUT_CLASS} text-start`}
              />
            </Field>
            {user.email && !user.emailVerified && (
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                className="-mt-2 self-start text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                {t("verifyEmail")}
              </button>
            )}

            {/* تاريخ الميلاد والمنطقة */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label={t("dob")} optional={t("optional")} error={errors.birthDate?.message} hint={t("dobHint")}>
                <input
                  type="date"
                  aria-invalid={!!errors.birthDate}
                  {...register("birthDate")}
                  className={`${INPUT_CLASS} w-full`}
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-foreground">{t("favoriteArea")}</span>
                <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-muted/70 px-3.5 text-sm font-semibold text-foreground">
                  <MapPin aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {user.location.city.name}، {user.location.governorate.name}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">{t("areaHint")}</span>
              </div>
            </div>

            {formError && (
              <p role="alert" className="text-xs text-destructive">
                {formError}
              </p>
            )}

            {/* زر الحفظ */}
            <div className="pt-3 flex items-center justify-between gap-4">
              <Button
                type="submit"
                disabled={update.isPending || !isDirty}
                className="h-11 px-8 rounded-xl font-extrabold text-sm shadow-xs cursor-pointer"
              >
                {update.isPending ? t("saving") : t("saveChanges")}
              </Button>
              {isSaved && !isDirty && (
                <span role="status" className="text-xs font-bold text-[#15803D] flex items-center gap-1">
                  <Check className="size-4" />
                  <span>{t("saveSuccess")}</span>
                </span>
              )}
            </div>
          </div>

          {/* كلمة السر */}
          <div className="rounded-[14px] border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <KeyRound aria-hidden className="size-4 text-muted-foreground" />
                {t("passwordTitle")}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.hasPassword ? t("passwordDesc") : t("passwordMissingDesc")}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordModalOpen(true)}
              className="h-10 shrink-0 text-xs font-bold cursor-pointer"
            >
              {user.hasPassword ? t("changePassword") : t("setPassword")}
            </Button>
          </div>

          {/* كارت منطقة الخطر: حذف الحساب */}
          <div className="rounded-[14px] border border-red-200/70 bg-red-50/40 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-destructive">{t("deleteTitle")}</span>
              <span className="text-xs text-muted-foreground">{t("deleteDesc")}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(true)}
              className="h-10 shrink-0 border-red-200 bg-card text-destructive hover:bg-destructive/10 text-xs font-bold cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>{t("deleteButton")}</span>
            </Button>
          </div>
        </main>
      </div>

      <ChangePhoneDialog open={phoneModalOpen} onOpenChange={setPhoneModalOpen} />
      {user.email && (
        <VerifyEmailDialog email={user.email} open={emailModalOpen} onOpenChange={setEmailModalOpen} />
      )}
      <ChangePasswordDialog hasPassword={user.hasPassword} open={passwordModalOpen} onOpenChange={setPasswordModalOpen} />
      <DeleteAccountDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen} />
    </form>
  );
}

type FieldProps = {
  label: string;
  optional?: string;
  error?: string;
  hint?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
};

function Field({ label, optional, error, hint, badge, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between gap-2 text-xs font-bold text-foreground">
        <span>
          {label} {optional && <span className="font-normal text-muted-foreground">{optional}</span>}
        </span>
        {badge}
      </span>
      {children}
      {error ? (
        <span role="alert" className="text-[11px] text-destructive">
          {error}
        </span>
      ) : (
        hint && <span className="text-[11px] text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

function StatusBadge({ verified, label }: { verified: boolean; label: string }) {
  return (
    <span
      className={
        verified
          ? "flex items-center gap-1 rounded-md bg-[#E7F4EA] px-2 py-1 text-[11px] font-bold text-[#15803D]"
          : "flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700"
      }
    >
      {verified && <Check className="size-3 stroke-[2.5]" />}
      <span>{label}</span>
    </span>
  );
}
