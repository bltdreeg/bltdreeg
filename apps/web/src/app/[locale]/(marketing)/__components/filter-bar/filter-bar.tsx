// شريط الترتيب السريع تحت الهيرو
import { Chip } from "@/components/atoms/chip";

const SORTS = [
  { id: "today", label: "فيه ميعاد النهارده" },
  { id: "nearest", label: "الأقرب ليك" },
  { id: "rating", label: "الأعلى تقييماً" },
  { id: "price", label: "أرخص سعر" },
  { id: "new", label: "أحدث الصالونات" },
] as const;

function FilterBar() {
  return (
    <nav
      aria-label="ترتيب الصالونات"
      className="border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto flex w-full max-w-[1312px] gap-2.5 overflow-x-auto px-4 py-4.5 md:px-16">
        {SORTS.map((s, i) => (
          <Chip key={s.id} variant={i === 0 ? "selected" : "default"}>
            {s.label}
          </Chip>
        ))}
      </div>
    </nav>
  );
}

export { FilterBar };
