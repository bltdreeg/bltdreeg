import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/atoms/skeleton";

export function SearchSkeleton() {
  const t = useTranslations("common");

  return (
    <div role="status" aria-label={t("loading")} className="flex flex-col gap-4">
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
    </div>
  );
}
