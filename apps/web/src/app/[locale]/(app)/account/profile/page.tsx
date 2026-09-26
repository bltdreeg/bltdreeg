import { getTranslations } from "next-intl/server";
import { METADATA_PROFILE } from "@/lib/data/constants/metadata.constants";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { currentUser } from "@/lib/data/user.constants";
import { ProfileForm } from "./__components/profile-form";

export const metadata = METADATA_PROFILE;

export default async function ProfilePage() {
  const t = await getTranslations("app.account.profile");
  const tAccount = await getTranslations("app.account");
  const user = currentUser;

  return (
    <div className="flex flex-col min-h-full">
      <ProfileBreadcrumb
        items={[
          { label: tAccount("title"), href: "/account" },
          { label: t("title") },
        ]}
      />

      <PageContainer className="py-6 sm:py-8 max-w-5xl">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-foreground">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <ProfileForm user={user} />
      </PageContainer>
    </div>
  );
}

