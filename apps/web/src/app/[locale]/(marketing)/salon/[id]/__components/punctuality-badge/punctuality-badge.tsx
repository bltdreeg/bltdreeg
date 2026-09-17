// شارة الالتزام: الصالون غالباً ماشي في ميعاده / متأخر شوية
import { Punctuality } from "@/lib/types/queue";
import { cn } from "@/lib/utils/cn.utils";

const COPY: Record<Punctuality, { label: string; className: string }> = {
  [Punctuality.ON_TIME]: { label: "الصالون غالباً ماشي في ميعاده", className: "bg-emerald-50 text-emerald-700" },
  [Punctuality.RUNNING_LATE]: { label: "الصالون متأخر شوية النهارده", className: "bg-amber-50 text-amber-700" },
};

export function PunctualityBadge({ punctuality, className }: { punctuality: Punctuality; className?: string }) {
  const { label, className: tone } = COPY[punctuality];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium", tone, className)}>
      <span aria-hidden className="size-2 rounded-full bg-current" />
      {label}
    </span>
  );
}
