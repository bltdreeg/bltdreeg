// الرئيسية — placeholder لحد ما الشاشة تتبني
import { useTranslations } from "use-intl";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function HomeScreen() {
  const t = useTranslations("common.bottomNav");
  return (
    <ScreenPlaceholder
      title={t("home")}
      frames="07–08, 18"
      links={[
        { label: "صفحة الصالون", href: "/salon/1" },
        { label: "الإشعارات", href: "/home/notifications" },
      ]}
    />
  );
}
