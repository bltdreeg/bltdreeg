import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/atoms/page-container";
import { Link } from "@/i18n/navigation";
import { areas } from "@/lib/data/areas.constants";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

function AreasGrid() {
  const t = useTranslations("marketing.home.areas");

  return (
    <PageContainer as="section" className="py-10 md:py-12">
      <div className="mb-4.5 flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
        <h2 className="text-lg font-bold md:text-[21px]">{t("title")}</h2>
        <p className="text-[13.5px] text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ul className="grid grid-cols-2 gap-3.5 md:grid-cols-5">
        {areas.map((area) => (
          <li key={area.id}>
            <Link
              href={{ pathname: ROUTE_SEARCH, query: { area: area.id } }}
              className="flex flex-col gap-1.5 rounded-xl border border-border bg-background px-4.5 py-4 transition-colors hover:border-primary hover:bg-tint"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span className="text-[15px] font-bold md:text-base">{area.name}</span>
              </div>
              <span className="tabular text-[13px] text-muted-foreground ps-5">
                {t("shopCount", { count: area.shopCount })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

export { AreasGrid };
