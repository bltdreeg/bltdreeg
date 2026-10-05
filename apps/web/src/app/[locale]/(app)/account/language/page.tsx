import { getTranslations } from "next-intl/server";
import { METADATA_LANGUAGE } from "@/lib/data/constants/metadata.constants";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { LanguageSelector } from "./__components/language-selector";

export const metadata = METADATA_LANGUAGE;

export default async function LanguagePage() {
  const t = await getTranslations("app.account.language");
  const tAccount = await getTranslations("app.account");

  return (
    <div className="flex flex-col min-h-full">
      <ProfileBreadcrumb
        items={[
          { label: tAccount("title"), href: "/account" },
          { label: t("title") },
        ]}
      />

      <PageContainer className="py-6 sm:py-8 max-w-4xl">
        <div className="mb-6 flex flex-col gap-1 max-w-2xl mx-auto w-full">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-foreground">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <LanguageSelector />
      </PageContainer>
    </div>
  );
}

