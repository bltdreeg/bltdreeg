import { getTranslations } from "next-intl/server";
import { METADATA_HOME } from "@/lib/data/constants/metadata.constants";
import { AppDownload } from "./__components/app-download";
import { BranchRail } from "./__components/branch-rail";
import { CitiesGrid } from "./__components/cities-grid";
import { Hero } from "./__components/hero";
import { NearbyBranches } from "./__components/nearby-branches";

export const metadata = METADATA_HOME;

// كل الصفوف من /branches الحقيقي. "آخر ما شفته" و"مقترح لك" و"الأكثر طلباً" وآراء العملاء
// بيرجعوا لما يبقى فيه تقييمات وحجوزات في الـ API — مش بنعرض بيانات تجريبية مكانهم
export default async function HomePage() {
  const t = await getTranslations("marketing.home");

  return (
    <>
      <Hero cityName={t("hero.defaultArea")} />

      <NearbyBranches />

      <BranchRail
        title={t("rails.newInArea.title")}
        subtitle={t("rails.newInArea.subtitle")}
        filters={{ sort: "newest" }}
      />
      <BranchRail
        title={t("rails.lowestPrice.title")}
        subtitle={t("rails.lowestPrice.subtitle")}
        filters={{ sort: "price" }}
      />

      <AppDownload />
      <CitiesGrid />
    </>
  );
}
