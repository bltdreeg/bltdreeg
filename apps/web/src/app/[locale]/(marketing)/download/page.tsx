// صفحة تحميل التطبيق — هيرو بقرار واحد، مميزات، خطوات، أسئلة، والجديد في التطبيق
import { METADATA_DOWNLOAD } from "@/lib/data/constants/metadata.constants";
import { DownloadFaq } from "./__components/download-faq";
import { DownloadFeatures } from "./__components/download-features";
import { DownloadHero } from "./__components/download-hero";
import { DownloadSteps } from "./__components/download-steps";

export const metadata = METADATA_DOWNLOAD;

export default function DownloadPage() {
  return (
    <>
      <DownloadHero />
      <DownloadFeatures />
      <DownloadSteps />
      <DownloadFaq />
    </>
  );
}
