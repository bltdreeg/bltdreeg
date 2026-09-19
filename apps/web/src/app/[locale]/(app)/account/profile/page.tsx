// بياناتي الشخصية — FRAME 36 في تصميم الموبايل
import { METADATA_PROFILE } from "@/lib/data/constants/metadata.constants";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { currentUser } from "@/lib/data/user.constants";
import { ProfileForm } from "./__components/profile-form";

export const metadata = METADATA_PROFILE;

export default function ProfilePage() {
  const user = currentUser;

  return (
    <div className="flex flex-col min-h-full">
      <ProfileBreadcrumb
        items={[
          { label: "حسابي", href: "/account" },
          { label: "بياناتي الشخصية" },
        ]}
      />

      <PageContainer className="py-6 sm:py-8 max-w-5xl">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-foreground">
            بياناتي الشخصية
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            عدّل اسمك وبريدك ومنطقتك، ورقم هاتفك الموثّق لحجوزاتك.
          </p>
        </div>

        <ProfileForm user={user} />
      </PageContainer>
    </div>
  );
}

