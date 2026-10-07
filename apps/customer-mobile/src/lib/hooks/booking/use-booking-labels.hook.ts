// نصوص الميعاد المشتركة (المراجعة، دخلت، الطابور): "النهارده" / "بكرة" / "الخميس ١٨ سبتمبر"، و"النهارده · ٧:٣٠ م"
import { useTranslations } from "use-intl";
import { useFormat } from "@/lib/hooks/use-format.hook";

const startOfDay = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

export function useBookingLabels() {
  const t = useTranslations("mobile.booking");
  const f = useFormat();
  const day = (iso: string) => {
    const days = Math.round((startOfDay(Date.parse(iso)) - startOfDay(Date.now())) / 86_400_000);
    return days === 0 ? t("slot.today") : days === 1 ? t("slot.tomorrow") : f.date(iso);
  };
  return {
    day,
    /** null = طابور دلوقتي */
    timing: (startAt: string | null) => (startAt ? t("review.slotDateTime", { day: day(startAt), time: f.time(startAt) }) : t("review.timingNow")),
  };
}
