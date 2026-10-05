// تسجيل الدخول — placeholder (frames 04–05). بيقرا /auth/options عشان يثبت السلسلة hook → action → apiClient → Laravel
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { ScreenPlaceholder } from "@/components/molecules/screen-placeholder";
import { useAuthOptions } from "@/lib/hooks/auth";
import { colors } from "@/styles/tokens";

export default function LoginScreen() {
  const t = useTranslations();
  const options = useAuthOptions();

  return (
    <ScreenPlaceholder
      title={t("auth.login.title")}
      frames="04–05"
      links={[
        { label: "إنشاء حساب", href: "/register" },
        { label: "OTP", href: "/otp" },
        { label: t("auth.login.forgotPassword"), href: "/forgot-password" },
        { label: t("auth.login.browseAsGuest"), onPress: () => router.replace("/home") },
      ]}
    >
      <Text style={styles.muted}>
        {options.isPending
          ? t("common.loading")
          : options.error
            ? options.error.message
            : options.data.otpChannels.join(" · ")}
      </Text>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textSecondary },
});
