// حسابي للضيف (فريم 43): كارت الدخول، اللي محتاج حساب (مقفول)، اللي متاح من غير حساب، والمساعدة
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { ListGroup, ListRow } from "@/components/molecules/settings-group";
import { Badge } from "@/components/molecules/status-badges";
import { colors, radius, sizes } from "@/styles/tokens";

const LOCKED: [IconName, string][] = [
  ["users", "lockedQueue"],
  ["calendar_check", "lockedBookings"],
  ["heart", "lockedFavorites"],
  ["star", "lockedRating"],
];
const ALLOWED: [IconName, string][] = [
  ["search", "allowedBrowse"],
  ["clock", "allowedWait"],
];

export function GuestAccount() {
  const t = useTranslations("mobile.account");
  return (
    <>
      <View style={styles.card}>
        <View style={styles.circle}>
          <Icon name="user" size={sizes.iconLg} color={colors.textDisabled} />
        </View>
        <Text variant="titleMd" style={styles.center}>
          {t("guest.title")}
        </Text>
        <Text variant="bodySm" color={colors.textSecondary} style={[styles.center, styles.body]}>
          {t("guest.body")}
        </Text>
        <Button label={t("guest.cta")} size="md" onPress={() => router.push({ pathname: "/login", params: { from: "/account" } })} />
      </View>

      <ListGroup label={t("guest.lockedHeader")}>
        {LOCKED.map(([icon, key]) => (
          <ListRow key={key} icon={icon} title={t(`guest.${key}`)} dimmed trailing={<Badge label={t("guest.locked")} />} />
        ))}
      </ListGroup>
      <ListGroup label={t("guest.availableHeader")}>
        {ALLOWED.map(([icon, key]) => (
          <ListRow key={key} icon={icon} iconColor={colors.okDark} title={t(`guest.${key}`)} trailing={<Icon name="check" size={sizes.iconSm} color={colors.okDark} />} />
        ))}
      </ListGroup>
      <ListGroup label={t("groupApp")}>
        <ListRow icon="help_circle" title={t("rowHelp")} onPress={() => router.push("/account/help")} />
      </ListGroup>
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 18, marginBottom: 22 },
  circle: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.surf, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 14 },
  center: { textAlign: "center", alignSelf: "stretch" },
  body: { marginTop: 6, marginBottom: 16 },
});
