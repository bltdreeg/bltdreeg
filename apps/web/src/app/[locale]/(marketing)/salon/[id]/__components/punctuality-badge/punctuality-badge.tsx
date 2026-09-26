"use client";
// شارة الالتزام — تستخدم Pill من التصميم عشان الألوان تبقى من اللوحة المقفّلة
import { useTranslations } from "next-intl";
import { Pill } from "@/components/atoms/pill";
import { Punctuality } from "@/lib/types/queue";

export function PunctualityBadge({
  punctuality,
  className,
}: {
  punctuality: Punctuality;
  className?: string;
}) {
  const t = useTranslations("marketing.salon.punctuality");
  const label = punctuality === Punctuality.ON_TIME ? t("onTime") : t("runningLate");
  const tone = punctuality === Punctuality.ON_TIME ? "success" : "warning";

  return (
    <Pill tone={tone} dot className={className}>
      {label}
    </Pill>
  );
}
