// استكشف حسب المنطقة
import { Link } from "@/i18n/navigation";
import { areas } from "@/lib/data/areas.constants";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

function AreasGrid() {
  return (
    <section className="mx-auto w-full max-w-[1312px] px-4 py-10 md:px-16 md:py-12">
      <div className="mb-4.5 flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
        <h2 className="text-lg font-bold md:text-[21px]">استكشف حسب المنطقة</h2>
        <p className="text-[13.5px] text-muted-foreground">القاهرة والجيزة</p>
      </div>

      <ul className="grid grid-cols-2 gap-3.5 md:grid-cols-5">
        {areas.map((area) => (
          <li key={area.id}>
            <Link
              href={{ pathname: ROUTE_SEARCH, query: { area: area.id } }}
              className="flex flex-col gap-1.5 rounded-xl border border-border bg-background px-4.5 py-4 transition-colors hover:border-primary hover:bg-tint"
            >
              <span className="text-[15px] font-bold md:text-base">{area.name}</span>
              <span className="tabular text-[13px] text-muted-foreground">
                {area.shopCount} صالون
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { AreasGrid };
