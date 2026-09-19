// سكة أفقية من التذاكر — بتتكرر لكل قسم في الرئيسية
import { PageContainer } from "@/components/atoms/page-container";
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
    <PageContainer as="section" className="flex flex-col gap-3 pt-6 md:pt-11">
      <div className="flex items-baseline justify-between gap-4">
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

      {/* شبكة 4 في الصف — الزيادة بتنزل سطر تحت، مفيش كارت بيتقص */}
      <div className="grid grid-cols-2 gap-4 pb-2 md:grid-cols-4 md:gap-5">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </PageContainer>
  );
}

export { ShopRail };
