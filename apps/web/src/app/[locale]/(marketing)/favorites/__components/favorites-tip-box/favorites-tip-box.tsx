import { BellRing } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn.utils";

interface FavoritesTipBoxProps {
  className?: string;
}

export function FavoritesTipBox({ className }: FavoritesTipBoxProps) {
  const t = useTranslations("marketing.favorites.tipBox");

  return (
    <aside
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 p-3.5 my-4",
        className
      )}
      aria-label={t("aria")}
    >
      <BellRing className="size-4 shrink-0 text-muted-foreground mt-0.5" />
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {t("tip")}
      </p>
    </aside>
  );
}

