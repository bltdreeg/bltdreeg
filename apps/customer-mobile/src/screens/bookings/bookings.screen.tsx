// حجوزاتي — placeholder لحد ما الشاشة تتبني
import { useTranslations } from "use-intl";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function BookingsScreen() {
  const t = useTranslations("common.bottomNav");
  return (
    <ScreenPlaceholder
      title={t("bookings")}
      frames="09–11"
      links={[
        { label: "متابعة الدور", href: "/queue/1" },
        { label: "تقييم الخدمة", href: "/booking/1/rate" },
      ]}
    />
  );
}
