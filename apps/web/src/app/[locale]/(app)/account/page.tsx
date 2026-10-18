// حسابي — FRAME 12A
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/atoms/page-container";
import { METADATA_ACCOUNT } from "@/lib/data/constants/metadata.constants";
import { AccountView } from "./__components/account-view";

export const metadata = METADATA_ACCOUNT;

export default async function AccountPage() {
  const t = await getTranslations("app.account");

  return (
    <PageContainer className="flex flex-col gap-6 py-8 md:py-9">
      {/* عنوان الصفحة */}
      <h1 className="text-[26px] font-extrabold text-foreground md:text-[28px]">
        {t("title")}
      </h1>

      <AccountView />
    </PageContainer>
  );
}
