// الرئيسية / اكتشف
import { METADATA_HOME } from "@/lib/data/constants/metadata.constants";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { shops } from "@/lib/data/shops.constants";
import { isToday } from "@/lib/utils/format/date.utils";
import { AppDownload } from "./__components/app-download";
import { AreasGrid } from "./__components/areas-grid";
import { FilterBar } from "./__components/filter-bar";
import { Hero } from "./__components/hero";
import { HomeReviews } from "./__components/home-reviews";
import { ShopRail } from "./__components/shop-rail";

export const metadata = METADATA_HOME;

const DEFAULT_AREA = "المعادي";

export default function HomePage() {
  const recentlyViewed = shops.slice(0, 5);
  const recommended = shops.filter((s) => s.rating >= 4.4 && !s.isNew).slice(0, 4);
  const newInArea = shops.filter((s) => s.isNew);
  const mostBooked = [...shops].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
  const availableToday = shops.filter((s) => s.nextSlotAt && isToday(s.nextSlotAt)).length;

  return (
    <>
      <Hero areaName={DEFAULT_AREA} />
      <FilterBar />

      <ShopRail title="آخر ما شفته" shops={recentlyViewed} href={ROUTE_SEARCH} />
      <ShopRail
        title="مقترح لك"
        subtitle="حسب تقييمك وزياراتك"
        shops={recommended}
        href={ROUTE_SEARCH}
      />
      <ShopRail
        title="جديد في منطقتك"
        subtitle="صالونات فتحت من شهرين"
        shops={newInArea}
        href={ROUTE_SEARCH}
      />
      <ShopRail
        title="الأكثر طلباً"
        subtitle={`${availableToday} صالون فيهم ميعاد النهارده`}
        shops={mostBooked}
        href={ROUTE_SEARCH}
      />

      <AppDownload />
      <HomeReviews />
      <AreasGrid />
    </>
  );
}
