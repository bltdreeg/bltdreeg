"use client";

// "صالونات قريبة منك": من الـ IP فورًا، وبتتحدث لوحدها لما الزائر يسمح بالموقع
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { PageContainer } from "@/components/atoms/page-container";
import { BranchCard } from "@/components/molecules/branch-card";
import { useNearbyBranches } from "@/lib/hooks/branches";
import { useVisitorPosition } from "@/lib/hooks/geo";

function NearbyBranches() {
  const t = useTranslations("marketing.home.nearby");
  const { position, permission, settled, locating, requestPosition } = useVisitorPosition();
  const branches = useNearbyBranches(position, settled);

  const pages = branches.data?.pages ?? [];
  const items = pages.flatMap((page) => page.items);
  const origin = pages[0]?.origin;
  const approximate = origin && origin.source !== "gps";

  return (
    <PageContainer as="section" className="flex flex-col gap-3 pt-6 md:pt-11">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold md:text-[21px]">
          {origin ? t("titleIn", { area: origin.area.name }) : t("title")}
        </h2>
        {approximate && (
          <p className="flex flex-wrap items-center gap-2 text-[13.5px] text-muted-foreground">
            {t("approximate")}
            {/* بعد الرفض المتصفح مش هيسأل تاني فمالوش لازمة الزرار */}
            {permission !== "denied" && (
              <Button type="button" variant="link" size="sm" onClick={requestPosition} disabled={locating} className="h-auto p-0">
                {locating ? t("locating") : t("useMyLocation")}
              </Button>
            )}
          </p>
        )}
      </div>

      {branches.isPending ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-[14px] bg-muted" />
          ))}
        </div>
      ) : branches.isError ? (
        <p className="text-[13.5px] text-muted-foreground">
          {t("error")}{" "}
          <Button type="button" variant="link" size="sm" onClick={() => void branches.refetch()} className="h-auto p-0">
            {t("retry")}
          </Button>
        </p>
      ) : items.length === 0 ? (
        <p className="text-[13.5px] text-muted-foreground">{t("empty")}</p>
      ) : (
        <>
          <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 ${branches.isPlaceholderData ? "opacity-60" : ""}`}>
            {items.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
          {branches.hasNextPage && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void branches.fetchNextPage()}
              disabled={branches.isFetchingNextPage}
              className="self-center rounded-full"
            >
              {t("loadMore")}
            </Button>
          )}
        </>
      )}
    </PageContainer>
  );
}

export { NearbyBranches };
