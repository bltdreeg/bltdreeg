"use client";

// "صالونات قريبة منك": من الـ IP فورًا، وبتتحدث لوحدها لما الزائر يسمح بالموقع
import { useTranslations } from "next-intl";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/atoms/button";
import { PageContainer } from "@/components/atoms/page-container";
import { BranchCard } from "@/components/molecules/branch-card";
import { QK_NEARBY_BRANCHES } from "@/lib/data/constants/query-keys.constants";
import { useNearbyBranches } from "@/lib/hooks/branches";
import { useVisitorPosition } from "@/lib/hooks/geo";
import type { NearbyBranchesPage } from "@/lib/types/branch";
import { resolveNearbyBranchesView } from "@/lib/utils/branches/nearby-branches-view";

function NearbyBranches() {
  const t = useTranslations("marketing.home.nearby");
  const { position, permission, settled, locating, requestPosition } = useVisitorPosition();
  const branches = useNearbyBranches(position, settled);

  // لو طلب الـ GPS فشل بعد ما كانت عندنا قائمة كويسة من الـ IP، منمسحهاش بشاشة error — بنرجع لنسختها
  // المحفوظة في كاش react-query (مفتاحها الثابت QK_NEARBY_BRANCHES(null))، من غير أي state محلي مكرّر.
  const queryClient = useQueryClient();
  const ipFallback = branches.isError
    ? queryClient.getQueryData<InfiniteData<NearbyBranchesPage>>(QK_NEARBY_BRANCHES(null))
    : undefined;

  const view = resolveNearbyBranchesView({
    pending: branches.isPending,
    isError: branches.isError,
    pages: branches.data?.pages ?? [],
    lastGoodPages: ipFallback?.pages ?? null,
  });

  const pages = view.kind === "pages" ? view.pages : [];
  const items = pages.flatMap((page) => page.items);
  const origin = pages[0]?.origin;
  const approximate = origin && origin.source !== "gps";

  return (
    <PageContainer as="section" className="flex flex-col gap-3 pt-6 md:pt-11">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold md:text-[21px]">
          {origin ? t("titleIn", { area: origin.city.name }) : t("title")}
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

      {view.kind === "loading" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-[14px] bg-muted" />
          ))}
        </div>
      ) : view.kind === "error" ? (
        <p className="text-[13.5px] text-muted-foreground">
          {t("error")}{" "}
          <Button type="button" variant="link" size="sm" onClick={() => void branches.refetch()} className="h-auto p-0">
            {t("retry")}
          </Button>
        </p>
      ) : view.kind === "empty" ? (
        <p className="text-[13.5px] text-muted-foreground">{t("empty")}</p>
      ) : (
        <>
          {/* view.stale: الطلب الحالي (غالبًا GPS) فشل، ودي آخر قائمة نجحت (IP) — بنوريها بتنبيه بسيط */}
          {view.stale && (
            <p className="text-[13.5px] text-muted-foreground">
              {t("error")}{" "}
              <Button type="button" variant="link" size="sm" onClick={() => void branches.refetch()} className="h-auto p-0">
                {t("retry")}
              </Button>
            </p>
          )}
          <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 ${branches.isPlaceholderData ? "opacity-60" : ""}`}>
            {items.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
          {!view.stale && branches.hasNextPage && (
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
