// قطع شاشات الدخول/التسجيل/الكود (فريم 04–06، 19–20): مربع العلامة، العنوان، فاصل "أو"، أزرار Google/Apple، سطر الرابط تحت.
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import type { ApiError } from "@/lib/utils/api/api-error";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { checkPasswordCriteria } from "@/lib/utils/auth-validation.utils";
import { colors, radius } from "@/styles/tokens";

/** مربع teal بالمقص (52) — أو أيقونة تانية في شاشة الكود (رسالة / خطأ) */
export function BrandTile({ icon = "scissors", tone = "brand" }: { icon?: IconName; tone?: "brand" | "tint" | "error" }) {
  const bg = tone === "brand" ? colors.teal : tone === "tint" ? colors.tealTint : colors.errTint;
  const fg = tone === "brand" ? colors.onPrimary : tone === "tint" ? colors.teal : colors.error;
  return (
    <View style={[styles.tile, { backgroundColor: bg }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Icon name={icon} size={24} color={fg} />
    </View>
  );
}

export function AuthTitle({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <View style={styles.titleBlock}>
      <Text variant="headline" accessibilityRole="header">
        {title}
      </Text>
      {subtitle && (typeof subtitle === "string" ? <Text variant="bodyLong">{subtitle}</Text> : subtitle)}
    </View>
  );
}

export function OrDivider({ label }: { label: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text variant="caption">{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

/** "المتابعة بحساب Google / Apple" — compact: نص نص في صف (فريم 06) */
export function SocialButtons({ onGoogle, onApple, compact, loading }: { onGoogle: () => void; onApple: () => void; compact?: boolean; loading?: boolean }) {
  const t = useTranslations("mobile.auth");
  // ponytail: Google mark stays multicolor (Google sign-in branding rules) while the board draws it grey — on the decision list.
  return (
    <View style={compact ? styles.socialRow : styles.socialCol}>
      <Button
        label={compact ? "Google" : t("continueGoogle")}
        variant="secondary"
        size="md"
        icon="google"
        disabled={loading}
        onPress={onGoogle}
        style={compact ? styles.flex : undefined}
      />
      <Button
        label={compact ? "Apple" : t("continueApple")}
        variant="secondary"
        size="md"
        leading={<Icon name="apple" size={20} color={colors.textPrimary} />}
        disabled={loading}
        onPress={onApple}
        style={compact ? styles.flex : undefined}
      />
    </View>
  );
}

/** "لسه معندكش حساب؟ اعمل واحد دلوقتي" */
export function FooterLink({ text, link, onPress }: { text: string; link: string; onPress: () => void }) {
  return (
    <View style={styles.footer}>
      <Text variant="label" size={14} color={colors.textSecondary}>
        {text}
      </Text>
      <LinkButton label={link} onPress={onPress} size={14} />
    </View>
  );
}

/** رسالة الخطأ للمستخدم من ApiError — نصوص التطبيق (البورد/ARB) مش رسالة السيرفر الخام */
/** شروط كلمة السر تحت الحقل (فريم 06): ✓ أخضر لما يتحقق، ✕ رمادي — وأحمر لو ناقص بعد الضغط */
export function PasswordRules({ password, highlight }: { password: string; highlight: boolean }) {
  const t = useTranslations("mobile.auth");
  const f = useFormat();
  const rules = checkPasswordCriteria(password);
  return (
    <View style={styles.rules} accessibilityLiveRegion="polite">
      <Rule ok={rules.min8} label={t("ruleLength", { count: f.count(8) })} highlight={highlight} />
      <Rule ok={rules.hasNumber} label={t("ruleDigit")} highlight={highlight} />
    </View>
  );
}

function Rule({ ok, label, highlight }: { ok: boolean; label: string; highlight: boolean }) {
  const color = ok ? colors.okDark : highlight ? colors.error : colors.textSecondary;
  return (
    <View style={styles.rule} accessible accessibilityLabel={label} accessibilityState={{ checked: ok }}>
      <Icon name={ok ? "check_bold" : "close"} size={15} color={color} />
      <Text dense variant="metaStrong" weight="semibold" color={color}>
        {label}
      </Text>
    </View>
  );
}

export function useAuthErrorText() {
  const t = useTranslations("mobile.auth");
  const f = useFormat();
  return (error: ApiError | null | undefined): string | null => {
    if (!error) return null;
    const n = (k: string) => (typeof error.data[k] === "number" ? (error.data[k] as number) : null);
    switch (error.code) {
      case "http.network":
        return t("network");
      case "auth.invalid_credentials":
        return t("invalidCredentials");
      case "auth.phone_not_registered":
      case "auth.account_not_found":
        return t("phoneNotRegistered");
      case "auth.phone_taken":
        return t("phoneTaken");
      case "auth.otp_invalid": {
        const left = n("attemptsLeft") ?? 0;
        return t("attemptsLeft", { count: left, n: f.count(left) });
      }
      case "auth.otp_locked":
        return t("otpLocked", { minutes: f.count(n("lockMinutes") ?? 10) });
      default:
        return error.status >= 500 ? t("generic") : error.message || t("generic");
    }
  };
}

const styles = StyleSheet.create({
  tile: { width: 52, height: 52, borderRadius: radius.card, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  titleBlock: { gap: 6 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24, marginBottom: 18 },
  line: { flex: 1, height: 1, backgroundColor: colors.line },
  socialCol: { gap: 10 },
  socialRow: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  rules: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginHorizontal: 2, marginTop: -6 },
  rule: { flexDirection: "row", alignItems: "center", gap: 5 },
  footer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 26, marginBottom: 8 },
});
