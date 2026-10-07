// نسيت كلمة السر — لسه بتتبني (فريم web only)
import { useTranslations } from "use-intl";
import { ComingSoon } from "@/components/organs/coming-soon";

export default function ForgotPasswordScreen() {
  const t = useTranslations("mobile.screens");
  return <ComingSoon title={t("forgotPassword")} />;
}
