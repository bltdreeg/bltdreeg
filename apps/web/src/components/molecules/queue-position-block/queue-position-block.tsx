import { useLocale, useTranslations } from "next-intl";
import type { QueueStatus } from "@/lib/types/queue";
import { cn } from "@/lib/utils/cn.utils";
import { formatTime } from "@/lib/utils/format/date.utils";

export function QueuePositionBlock({
  startAt,
  status,
  className,
}: {
  startAt: string;
  status: Pick<QueueStatus, "queueNumber" | "peopleAhead">;
  className?: string;
}) {
  const t = useTranslations("common.queuePosition");
  const locale = useLocale();

  return (
    <div className={cn("grid grid-cols-2 divide-x divide-x-reverse rounded-2xl border bg-card p-4 text-center", className)}>
      <div>
        <p className="text-sm text-muted-foreground">{t("appointment")}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">{formatTime(startAt, locale)}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{t("queueNumber")}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">{status.queueNumber}</p>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {t("ahead", { count: status.peopleAhead })}
        </p>
      </div>
    </div>
  );
}
