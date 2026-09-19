// شارة الالتزام — تستخدم Pill من التصميم عشان الألوان تبقى من اللوحة المقفّلة
import { Pill } from "@/components/atoms/pill";
import { Punctuality } from "@/lib/types/queue";

const COPY: Record<Punctuality, { label: string; tone: "success" | "warning" }> = {
  [Punctuality.ON_TIME]: { label: "الصالون غالباً ماشي في ميعاده", tone: "success" },
  [Punctuality.RUNNING_LATE]: { label: "الصالون متأخر شوية النهارده", tone: "warning" },
};

export function PunctualityBadge({
  punctuality,
  className,
}: {
  punctuality: Punctuality;
  className?: string;
}) {
  const { label, tone } = COPY[punctuality];
  return (
    <Pill tone={tone} dot className={className}>
      {label}
    </Pill>
  );
}
