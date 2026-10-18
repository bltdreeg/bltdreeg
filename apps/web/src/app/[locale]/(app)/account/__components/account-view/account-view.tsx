"use client";

// محتوى حسابي — بيقرا العميل من /me عن طريق useUser
import { useTranslations } from "next-intl";
import { useUser } from "@/lib/hooks/user";
import { AccountHeader } from "../account-header";
import { AccountMenu } from "../account-menu";
import { AccountSkeleton } from "../account-skeleton";
import { LogoutDialog } from "../logout-dialog";

export function AccountView() {
  const t = useTranslations("app.account");
  const { user, isLoading } = useUser();

  // proxy.ts بيمنع الدخول من غير جلسة، فـ user = null هنا معناه إن الجلسة لسه بتتحمّل أو انتهت
  if (isLoading || !user) return <AccountSkeleton />;

  return (
    <>
      {/* كارت البروفايل */}
      <AccountHeader user={user} />

      {/* أقسام الحساب والتطبيق والمساعدة */}
      <AccountMenu />

      {/* تسجيل الخروج */}
      <div className="flex flex-col items-start gap-3.5 pt-2 pb-24 md:pb-8">
        <LogoutDialog
          trigger={
            <button
              type="button"
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#FECACA] bg-card px-6 text-[15px] font-bold text-destructive transition-colors hover:bg-destructive/10 sm:w-auto"
            >
              <svg
                className="size-[15px] shrink-0 stroke-[2.2]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14.5 4.5h-8v15h8" />
                <path d="M11 12h9.5M17.5 8.5 21 12l-3.5 3.5" />
              </svg>
              <span>{t("logout")}</span>
            </button>
          }
        />
      </div>
    </>
  );
}
