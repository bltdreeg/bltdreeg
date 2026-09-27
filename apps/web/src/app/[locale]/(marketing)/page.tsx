import { getTranslations } from "next-intl/server";
import { TextLoop } from "@/components/atoms/text-loop";
import { METADATA_HOME } from "@/lib/data/constants/metadata.constants";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { shops } from "@/lib/data/shops.constants";
import { isToday } from "@/lib/utils/format/date.utils";
import { AppDownload } from "./__components/app-download";
import { Hero } from "./__components/hero";
import { HomeReviews } from "./__components/home-reviews";
import { PartnerBanner } from "./__components/partner-banner";
import { ShopRail } from "./__components/shop-rail";

export const metadata = METADATA_HOME;

const DEFAULT_AREA = "المعادي";

export default async function HomePage() {
  const t = await getTranslations("marketing.home.rails");
  const tHome = await getTranslations("marketing.home");

  // عدد مختلف لكل قسم عشان الصفحة ما تبقاش شبكة مكررة — 4 في الصف والزيادة تنزل تحت
  const recentlyViewed = shops.slice(0, 5);
  const recommended = shops.filter((s) => s.rating >= 4.4 && !s.isNew).slice(0, 4);
  // الجديد الأول، وبعدين الباقي عشان نوصل 6 — الفلتر لوحده بيرجّع 4 بس
  const newInArea = [...shops].sort((a, b) => Number(b.isNew) - Number(a.isNew)).slice(0, 6);
  const mostBooked = [...shops].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 7);
  const availableToday = shops.filter((s) => s.nextSlotAt && isToday(s.nextSlotAt)).length;

  return (
    <>
      <Hero areaName={DEFAULT_AREA} />

      <ShopRail title={t("recentlyViewed.title")} shops={recentlyViewed} href={ROUTE_SEARCH} />
      <ShopRail
        title={t("recommended.title")}
        subtitle={t("recommended.subtitle")}
        shops={recommended}
        href={ROUTE_SEARCH}
      />
      <ShopRail
        title={t("newInArea.title")}
        subtitle={t("newInArea.subtitle")}
        shops={newInArea}
        href={ROUTE_SEARCH}
      />
      <ShopRail
        title={t("mostBooked.title")}
        subtitle={t("mostBooked.subtitle", { count: availableToday })}
        shops={mostBooked}
        href={ROUTE_SEARCH}
      />

      {/* شريط النص الملفوف — الـ SVG مقاسه 1200x520 فبنقص الفاضي فوق وتحت بالـ aspect */}
      <div className="flex aspect-[1200/260] items-center overflow-hidden" aria-hidden>
        <TextLoop text={tHome("loop")} shape="wave" curviness={25} speed={80} fontSize={44} />
      </div>

      <AppDownload />
      <HomeReviews />
      <PartnerBanner />
    </>
  );
}
