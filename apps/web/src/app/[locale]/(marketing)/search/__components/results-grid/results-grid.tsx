// شبكة نتايج البحث — 3 في الصف على الديسكتوب، عمود واحد على الموبايل
import type { Shop } from "@/lib/types/shop/shop.interface";
import { ResultCard } from "../result-card";

function ResultsGrid({ shops }: { shops: Shop[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop) => (
        <li key={shop.id}>
          <ResultCard shop={shop} />
        </li>
      ))}
    </ul>
  );
}

export { ResultsGrid };
