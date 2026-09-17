// سكة أفقية من التذاكر — بتتكرر لكل قسم في الرئيسية
import { ShopCard } from "@/components/molecules/shop-card";
import { Link } from "@/i18n/navigation";
import type { Shop } from "@/lib/types/shop/shop.interface";

type ShopRailProps = {
  title: string;
  subtitle?: string;
  shops: Shop[];
  /** رابط "عرض الكل" */
  href: string;
};

function ShopRail({ title, subtitle, shops, href }: ShopRailProps) {
  if (shops.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 pt-6 md:pt-11">
      <div className="mx-auto flex w-full max-w-[1312px] items-baseline justify-between gap-4 px-4 md:px-16">
        <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
          <h2 className="text-lg font-bold md:text-[21px]">{title}</h2>
          {subtitle && <p className="text-[13.5px] text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13.5px] font-bold text-primary hover:text-primary-pressed"
        >
          عرض الكل
          <span
            aria-hidden
            className="inline-block size-[7px] rotate-45 border-b-[1.5px] border-s-[1.5px] border-current"
          />
        </Link>
      </div>

      {/* السكة بتنزف في الهامش عشان تبان إنها بتكمل */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:gap-5 md:px-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} className="snap-start" />
        ))}
      </div>
    </section>
  );
}

export { ShopRail };
