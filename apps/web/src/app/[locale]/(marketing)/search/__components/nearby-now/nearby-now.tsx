// قريب منك دلوقتي — فيها مواعيد فاضية في الساعتين الجايين (FRAME 03A)
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import type { Shop } from "@/lib/types/shop/shop.interface";
import { ShopCard } from "@/components/molecules/shop-card";

function NearbyNow({ shops }: { shops: Shop[] }) {
  if (shops.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[21px] font-bold">قريب منك دلوقتي</h2>
          <p className="text-[13.5px] text-muted-foreground">فيها مواعيد فاضية في الساعتين الجايين</p>
        </div>
        <Link
          href={ROUTE_SEARCH}
          className="whitespace-nowrap text-[13.5px] font-bold text-primary hover:text-primary-pressed"
        >
          عرض الكل
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shops.map((shop) => (
          <li key={shop.id}>
            <ShopCard shop={shop} notchColor="var(--card)" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export { NearbyNow };
