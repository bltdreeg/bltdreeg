// انضم كصالون — صفحة الشراكة: هيرو بقرار واحد، خطوات التسجيل، المميزات، وأسئلة الصالونات
import { METADATA_PARTNER } from "@/lib/data/constants/metadata.constants";
import { PartnerFaq } from "./__components/partner-faq";
import { PartnerFeatures } from "./__components/partner-features";
import { PartnerHero } from "./__components/partner-hero";
import { PartnerSteps } from "./__components/partner-steps";

export const metadata = METADATA_PARTNER;

export default function PartnerPage() {
  return (
    <>
      <PartnerHero />
      <PartnerSteps />
      <PartnerFeatures />
      <PartnerFaq />
    </>
  );
}
