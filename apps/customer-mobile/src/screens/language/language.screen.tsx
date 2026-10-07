// اللغة — لسه بتتبني (فريم 38)
import { useTranslations } from "use-intl";
import { ComingSoon } from "@/components/organs/coming-soon";

export default function LanguageScreen() {
  const t = useTranslations("mobile.screens");
  return <ComingSoon title={t("language")} />;
}
