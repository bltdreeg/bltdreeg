// صندوق التنبيه الذكي في أسفل قائمة المفضلة من FRAME 34 في mobile.html
import { BellRing } from "lucide-react";
import { cn } from "@/lib/utils/cn.utils";

interface FavoritesTipBoxProps {
  className?: string;
}

export function FavoritesTipBox({ className }: FavoritesTipBoxProps) {
  return (
    <aside
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 p-3.5 my-4",
        className
      )}
      aria-label="تنبيه المفضلة الذكي"
    >
      <BellRing className="size-4 shrink-0 text-muted-foreground mt-0.5" />
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        بنبعتلك إشعار لما صالون مفضّل عندك يبقى فاضي في وقت بتروح فيه عادةً.
      </p>
    </aside>
  );
}

