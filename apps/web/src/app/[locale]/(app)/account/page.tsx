// حسابي — FRAME 12A
import { METADATA_ACCOUNT } from "@/lib/data/constants/metadata.constants";
import { PageContainer } from "@/components/atoms/page-container";
import { currentUser } from "@/lib/data/user.constants";
import { AccountHeader } from "./__components/account-header";
import { AccountMenu } from "./__components/account-menu";
import { LogoutDialog } from "./__components/logout-dialog";

export const metadata = METADATA_ACCOUNT;

export default function AccountPage() {
  const user = currentUser;

  return (
    <PageContainer className="flex flex-col gap-6 py-8 md:py-9">
      {/* عنوان الصفحة */}
      <h1 className="text-[26px] font-extrabold text-foreground md:text-[28px]">
        حسابي
      </h1>

      {/* كارت البروفايل */}
      <AccountHeader user={user} />

      {/* أقسام الحساب والتطبيق والمساعدة */}
      <AccountMenu
        favoriteCount={user.favoriteShopIds?.length ?? 4}
        upcomingBookingsCount={2}
      />

      {/* تسجيل الخروج وإصدار التطبيق */}
      <div className="flex flex-col items-start gap-3.5 pt-2 pb-24 md:pb-8">
        <LogoutDialog
          userName={user.name}
          salonName="صالون الكابتن حسام"
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
              <span>تسجيل الخروج</span>
            </button>
          }
        />
        <span
          dir="ltr"
          className="tabular text-[12.5px] text-muted-foreground"
        >
          بالتدريج 2.4.1 (build 318)
        </span>
      </div>
    </PageContainer>
  );
}
