import { useTranslations } from "next-intl";
import type { Shop } from "@/lib/types/shop/shop.interface";
import { ResultRow, type ShopStatus } from "../results-list";

// حالة تجريبية ثابتة — نفس منطق نتايج البحث العادية
function statusOf(index: number): ShopStatus {
  return { delayMinutes: 0, queueNumber: index + 2 };
}

function Suggestions({ shops }: { shops: Shop[] }) {
  const t = useTranslations("marketing.search.suggestions");

  if (shops.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[17px] font-bold">{t("didYouMean")}</h2>
      <ul className="flex flex-col gap-3">
        {shops.map((shop, i) => (
          <li key={shop.id}>
            <ResultRow shop={shop} status={statusOf(i)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export { Suggestions };
