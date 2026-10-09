"use client";

import { useState } from "react";
import { Camera, Check, AlertTriangle, Trash2, Calendar, MapPin, ShieldCheck, ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ROUTE_ACCOUNT } from "@/lib/data/constants/routes.constants";
import type { User } from "@/lib/types/user/user.interface";

interface ProfileFormProps {
  user: User;
}

const CITIES = [
  { id: "maadi", name: "المعادي، القاهرة" },
  { id: "nasr-city", name: "مدينة نصر، القاهرة" },
  { id: "dokki", name: "الدقي، الجيزة" },
  { id: "mohandessin", name: "المهندسين، الجيزة" },
  { id: "tagamoa", name: "التجمع الخامس، القاهرة الجديدة" },
  { id: "heliopolis", name: "مصر الجديدة، القاهرة" },
  { id: "sheikh-zayed", name: "الشيخ زايد، الجيزة" },
];

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const t = useTranslations("app.account.profile");

  const [firstName, setFirstName] = useState("كريم");
  const [lastName, setLastName] = useState("مصطفى");
  const [email, setEmail] = useState("karim.mustafa@gmail.com");
  const [dob, setDob] = useState("1996-03-14");
  const [cityId, setCityId] = useState(user.cityId || "maadi");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // States
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [changePhoneModalOpen, setChangePhoneModalOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 500);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* العمود الجانبي: صورة الحساب وبطاقة الأمان */}
        <aside className="flex flex-col gap-5 lg:col-span-4">
          <div className="flex flex-col items-center justify-center rounded-[14px] border border-border bg-card p-6 text-center shadow-xs">
            {/* الصورة الشخصية */}
            <div className="relative mb-3">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-tint text-2xl font-black text-primary-pressed shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="size-full object-cover" />
                ) : (
                  <span>{firstName[0]} {lastName[0]}</span>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -start-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary text-white shadow-sm hover:bg-primary-hover transition-colors"
                aria-label={t("changePhotoAria")}
              >
                <Camera className="size-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </label>
            </div>
            <label
              htmlFor="avatar-upload"
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              {t("changePhoto")}
            </label>
            <h2 className="mt-3 text-base font-extrabold text-foreground">
              {firstName} {lastName}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("memberSince", {
                date: user.joinedDate || "يونيو 2025",
                count: user.completedBookingsCount || 12,
              })}
            </span>
          </div>

          {/* بطاقة توثيق الهوية */}
          <div className="rounded-[14px] border border-border bg-muted/40 p-4.5 text-start">
            <div className="flex items-center gap-2 text-primary-pressed">
              <ShieldCheck className="size-4.5" />
              <span className="text-xs font-bold">{t("securityTitle")}</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {t("securityDesc")}
            </p>
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
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  {t("firstName")}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-11 rounded-xl border border-border bg-muted/40 px-3.5 text-sm font-semibold text-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  {t("lastName")}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-11 rounded-xl border border-border bg-muted/40 px-3.5 text-sm font-semibold text-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            {/* رقم الموبايل (مقفل + تحقق OTP) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">
                {t("phone")}
              </label>
              <div className="flex h-11 items-center justify-between rounded-xl border border-border bg-muted/70 px-3.5">
                <div className="flex items-center gap-2 direction-ltr font-mono font-bold text-sm text-foreground">
                  <span className="text-xs text-muted-foreground border-r border-border pr-2">
                    +20 🇪🇬
                  </span>
                  <span>0102 345 6789</span>
                </div>
                <div className="flex items-center gap-1 rounded-md bg-[#E7F4EA] px-2 py-1 text-[11px] font-bold text-[#15803D]">
                  <Check className="size-3 stroke-[2.5]" />
                  <span>{t("verified")}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <span className="text-muted-foreground">{t("phoneIdentity")}</span>
                <button
                  type="button"
                  onClick={() => setChangePhoneModalOpen(true)}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  {t("changePhone")}
                </button>
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">
                {t("email")} <span className="font-normal text-muted-foreground">{t("optional")}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-11 rounded-xl border border-border bg-muted/40 px-3.5 text-sm font-semibold text-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>

            {/* تاريخ الميلاد والمنطقة */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  {t("dob")} <span className="font-normal text-muted-foreground">{t("optional")}</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-muted/40 px-3.5 text-sm font-semibold text-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {t("dobHint")}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground">
                  {t("favoriteArea")}
                </label>
                <div className="relative">
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-border bg-muted/40 px-3.5 pe-8 text-sm font-semibold text-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* زر الحفظ */}
            <div className="pt-3 flex items-center justify-between gap-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-11 px-8 rounded-xl font-extrabold text-sm shadow-xs cursor-pointer"
              >
                {isSaving ? t("saving") : t("saveChanges")}
              </Button>
              {isSaved && (
                <span className="text-xs font-bold text-[#15803D] flex items-center gap-1">
                  <Check className="size-4" />
                  <span>{t("saveSuccess")}</span>
                </span>
              )}
            </div>
          </div>

          {/* كارت منطقة الخطر: حذف الحساب */}
          <div className="rounded-[14px] border border-red-200/70 bg-red-50/40 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-destructive">
                {t("deleteTitle")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("deleteDesc")}
              </span>
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

      {/* حوار تغيير رقم الهاتف (OTP Flow) */}
      <Dialog.Root open={changePhoneModalOpen} onOpenChange={setChangePhoneModalOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl text-start">
            <Dialog.Title className="text-lg font-extrabold text-foreground">
              {t("changePhoneModal.title")}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t("changePhoneModal.desc")}
            </Dialog.Description>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex h-11 items-center rounded-xl border border-border bg-muted/40 px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <span className="text-xs font-mono text-muted-foreground border-e border-border pe-2">
                  +20 🇪🇬
                </span>
                <input
                  type="tel"
                  placeholder="010xxxxxxxx"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-transparent ps-2.5 font-mono text-sm font-bold text-foreground focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setChangePhoneModalOpen(false)}
                  className="flex-1 h-10 text-xs font-bold"
                >
                  {t("changePhoneModal.submit")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChangePhoneModalOpen(false)}
                  className="h-10 text-xs font-bold"
                >
                  {t("changePhoneModal.cancel")}
                </Button>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* حوار تأكيد حذف الحساب */}
      <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl text-start">
            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-3">
              <AlertTriangle className="size-6" />
            </div>
            <Dialog.Title className="text-lg font-extrabold text-foreground">
              {t("deleteModal.title")}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t("deleteModal.desc")}
            </Dialog.Description>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  router.push(ROUTE_ACCOUNT);
                }}
                className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 transition-colors"
              >
                {t("deleteModal.confirm")}
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="h-10 px-4 rounded-xl border border-border bg-card text-foreground text-xs font-bold hover:bg-muted transition-colors"
              >
                {t("deleteModal.cancel")}
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </form>
  );
}

