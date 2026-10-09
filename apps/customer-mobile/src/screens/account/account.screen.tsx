// حسابي (فريم 16، 17، 43): الحساب بـ ٣ مجموعات + تأكيد الخروج اللي بيقول أثره على الدور، وحالة الضيف بتقول الممنوع بدل حيطة.
// ponytail: English freeze (user, 2026-10-06) — don't render the "اللغة" row here; comes back in the English batch.
import Constants from "expo-constants";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Avatar } from "@/components/atoms/avatar";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { ListGroup, ListRow } from "@/components/molecules/settings-group";
import { ConfirmDialog } from "@/components/organs/confirm-dialog";
import { salonName } from "@/components/organs/salon-card";
import { useCurrentUser, useLogout } from "@/lib/hooks/auth";
import { useMyBookings } from "@/lib/hooks/booking";
import { useFavoriteIds } from "@/lib/hooks/favorites";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { useSession } from "@/lib/hooks/use-session.hook";
import { isRunning } from "@/lib/utils/booking/booking-pricing";
import { splitBookings } from "@/lib/utils/booking/bookings-list";
import { colors, radius } from "@/styles/tokens";
import { GuestAccount } from "./__sections/guest-account";

export default function AccountScreen() {
  const t = useTranslations("mobile");
  const f = useFormat();
  const { gutter, listMaxWidth } = useResponsive();
  const { hasSession } = useSession();
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}>
        <Text variant="pageTitle" accessibilityRole="header" style={styles.title}>
          {t("screens.account")}
        </Text>
        {hasSession ? <SignedIn /> : <GuestAccount />}
        <Text variant="caption" size={12} weight="semibold" color={colors.textDisabled} style={styles.version}>
          {t("account.version", { version: f.ltr(Constants.expoConfig?.version ?? "") })}
        </Text>
        {__DEV__ && <Button label="Design system" variant="secondary" size="sm" onPress={() => router.push("/dev/design-system")} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function SignedIn() {
  const t = useTranslations("mobile.account");
  const f = useFormat();
  const user = useCurrentUser().data;
  const bookings = useMyBookings().data ?? [];
  const favorites = useFavoriteIds().data?.length ?? 0;
  const logout = useLogout();
  const [confirming, setConfirming] = useState(false);

  const { active } = splitBookings(bookings);
  const completed = bookings.filter((b) => b.status === "completed").length;
  const queue = active.find(isRunning);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const toProfile = () => router.push("/account/profile");

  return (
    <>
      <View style={styles.header}>
        {user ? <Avatar name={name} size={64} ring /> : <Skeleton width={64} height={64} radius={32} />}
        <View style={styles.flex}>
          {user ? (
            <>
              <Text variant="titleMd" numberOfLines={1}>
                {name}
              </Text>
              {user.phone && <Text variant="meta">{f.phone(user.phone)}</Text>}
            </>
          ) : (
            <View style={styles.nameSkeleton}>
              <Skeleton width="60%" height={18} strong />
              <Skeleton width="40%" height={14} />
            </View>
          )}
        </View>
        <Button label={t("edit")} variant="secondary" size="xs" expand={false} onPress={toProfile} />
      </View>

      <View style={styles.stats}>
        <Stat value={f.number(completed)} label={t("statCuts")} />
        <Stat value={f.number(favorites)} label={t("statFavorites")} />
      </View>

      <ListGroup label={t("groupAccount")}>
        <ListRow icon="user" title={t("rowProfile")} onPress={toProfile} />
        <ListRow
          icon="calendar_check"
          title={t("rowBookings")}
          value={active.length ? t("activeValue", { count: active.length, n: f.number(active.length) }) : undefined}
          onPress={() => router.navigate("/bookings")}
        />
        <ListRow icon="heart" title={t("rowFavorites")} value={favorites ? f.number(favorites) : undefined} onPress={() => router.push("/account/favorites")} />
      </ListGroup>
      <ListGroup label={t("groupApp")}>
        <ListRow icon="bell" title={t("rowNotifications")} onPress={() => router.push("/account/notification-settings")} />
      </ListGroup>
      <ListGroup label={t("groupHelp")}>
        <ListRow icon="help_circle" title={t("rowHelp")} onPress={() => router.push("/account/help")} />
      </ListGroup>

      <Button label={t("signOut")} variant="dangerOutline" icon="logout" size="lg" onPress={() => setConfirming(true)} style={styles.signOut} />

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        icon="logout"
        title={t("signOutDialog.title")}
        message={queue ? t("signOutDialog.bodyInQueue", { salon: salonName(queue.salonName) }) : t("signOutDialog.body")}
        confirmLabel={t("signOutDialog.confirm")}
        cancelLabel={t("signOutDialog.cancel")}
        onConfirm={() => {
          setConfirming(false);
          logout.mutate();
        }}
      />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="titleMd" size={19} digits>
        {value}
      </Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, width: "100%", alignSelf: "center", paddingBottom: 24 },
  title: { paddingTop: 14, paddingBottom: 16 },
  flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingBottom: 18 },
  nameSkeleton: { gap: 8 },
  stats: { flexDirection: "row", gap: 10, marginBottom: 22 },
  stat: { flex: 1, backgroundColor: colors.surf, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 14, gap: 2 },
  signOut: { marginTop: 6 },
  version: { textAlign: "center", alignSelf: "stretch", marginTop: 18, marginBottom: 8 },
});
