// المساعدة والدعم — FRAME 42 في تصميم الموبايل
import { METADATA_HELP } from "@/lib/data/constants/metadata.constants";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { HelpView } from "./__components/help-view";

export const metadata = METADATA_HELP;

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-full">
      <ProfileBreadcrumb
        items={[
          { label: "حسابي", href: "/account" },
          { label: "المساعدة والدعم" },
        ]}
      />

      <PageContainer className="py-6 sm:py-8 max-w-5xl">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-foreground">
            المساعدة والدعم
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            إجابات عن مشاكل الطابور والحجوزات، وقنوات التواصل المباشر مع فريق بالتدريج.
          </p>
        </div>

        <HelpView />
      </PageContainer>
    </div>
  );
}

