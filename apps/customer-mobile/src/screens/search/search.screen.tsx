// البحث — placeholder لحد ما الشاشة تتبني
import { useTranslations } from "use-intl";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";

export default function SearchScreen() {
  const t = useTranslations("common.bottomNav");
  return <ScreenPlaceholder title={t("search")} frames="12–15" links={[{ label: "صفحة الصالون", href: "/salon/1" }]} />;
}
