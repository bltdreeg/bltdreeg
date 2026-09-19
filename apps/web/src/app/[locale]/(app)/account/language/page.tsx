// لغة التطبيق — FRAME 38 في تصميم الموبايل
import { METADATA_LANGUAGE } from "@/lib/data/constants/metadata.constants";
import { PageContainer } from "@/components/atoms/page-container";
import { ProfileBreadcrumb } from "@/components/molecules/profile-breadcrumb";
import { LanguageSelector } from "./__components/language-selector";

export const metadata = METADATA_LANGUAGE;

export default function LanguagePage() {
  return (
    <div className="flex flex-col min-h-full">
      <ProfileBreadcrumb
        items={[
          { label: "حسابي", href: "/account" },
          { label: "لغة التطبيق" },
        ]}
      />

      <PageContainer className="py-6 sm:py-8 max-w-4xl">
        <div className="mb-6 flex flex-col gap-1 max-w-2xl mx-auto w-full">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-foreground">
            لغة التطبيق
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            اختر لغة الواجهة المفضلة لك، سيتم تطبيق اتجاه الكتابة المناسب تلقائياً.
          </p>
        </div>

        <LanguageSelector />
      </PageContainer>
    </div>
  );
}

