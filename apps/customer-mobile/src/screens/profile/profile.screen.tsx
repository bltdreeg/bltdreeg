// بياناتي الشخصية (فريم 36) — زي EditProfilePage في Flutter. الموبايل مقفول لأنه الهوية (تغييره = المساعدة).
// المنطقة هي نفس منطقة الرئيسية المختارة على الجهاز. "امسح حسابي" بتأكيد بيقول الأثر.
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Avatar } from "@/components/atoms/avatar";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { Badge } from "@/components/molecules/status-badges";
import { FieldFrame, PhoneField, TextField } from "@/components/molecules/text-field";
import { useToast } from "@/components/molecules/toast";
import { TopBar } from "@/components/molecules/top-bar";
import { AreaSheet } from "@/components/organs/area-sheet";
import { ConfirmDialog } from "@/components/organs/confirm-dialog";
import { FormScreen } from "@/components/organs/form-screen";
import { useCurrentUser, useDeleteAccount, useUpdateProfile } from "@/lib/hooks/auth";
import { useAreas, useSelectedArea } from "@/lib/hooks/salons";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { Customer } from "@/lib/types/auth";
import { dayKey, dayMs } from "@/lib/utils/day-keys";
import { colors, sizes } from "@/styles/tokens";

/** حقل بيفتح اختيار (تاريخ، منطقة): أيقونة + القيمة + سهم */
function PickerField({ label, optional, helper, icon, value, onPress }: { label: string; optional?: boolean; helper?: string; icon: "calendar" | "map_pin"; value: string; onPress: () => void }) {
  return (
    <FieldFrame label={label} optional={optional} helper={helper ? <Text variant="caption">{helper}</Text> : undefined}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}، ${value}`} pressedScale={1} style={styles.picker}>
        <Icon name={icon} size={sizes.icon} color={colors.textSecondary} />
        <Text variant="input" numberOfLines={1} style={styles.flex}>
          {value}
        </Text>
        <Icon name="chevron_down" size={16} color={colors.textSecondary} />
      </Pressable>
    </FieldFrame>
  );
}

function Form({ user, show }: { user: Customer; show: (text: string) => void }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const areaId = useSelectedArea();
  const areas = useAreas().data ?? [];
  const area = areas.find((a) => a.id === areaId);
  const update = useUpdateProfile();
  const remove = useDeleteAccount();
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [birthDate, setBirthDate] = useState(user.birthDate);
  const [picking, setPicking] = useState<"date" | "area" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const nameMissing = !firstName.trim();
  const birthMs = birthDate ? dayMs(birthDate) : null;
  const now = new Date();

  const save = () =>
    update.mutateAsync({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() || null, birthDate }).then(
      () => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        show(t("profile.saved"));
      },
      () => show(t("booking.errors.generic")),
    );

  return (
    <>
      <View style={styles.avatar}>
        <View>
          <Avatar name={[firstName, lastName].join(" ")} size={84} ring />
          <Pressable onPress={() => show(t("profile.photoNotSupported"))} accessibilityLabel={t("profile.changePhoto")} visualSize={{ width: 30, height: 30 }} style={styles.camera}>
            <Icon name="camera" size={15} color={colors.onPrimary} />
          </Pressable>
        </View>
        <LinkButton label={t("profile.changePhoto")} onPress={() => show(t("profile.photoNotSupported"))} />
      </View>

      <View style={styles.names}>
        <View style={styles.flex}>
          <TextField label={t("profile.firstName")} value={firstName} onChangeText={setFirstName} error={nameMissing ? t("profile.nameRequired") : null} autoComplete="given-name" />
        </View>
        <View style={styles.flex}>
          <TextField label={t("profile.lastName")} value={lastName} onChangeText={setLastName} autoComplete="family-name" />
        </View>
      </View>
      <PhoneField
        label={t("profile.phone")}
        value={user.phone ?? ""}
        locked
        suffix={user.phoneVerified ? <Badge label={t("profile.verified")} kind="success" icon="check" /> : undefined}
        helper={
          <View style={styles.phoneHelper}>
            <Text variant="caption" style={styles.flex}>
              {t("profile.phoneIsIdentity")}
            </Text>
            <LinkButton label={t("profile.changePhone")} size={12.5} onPress={() => router.push("/account/help")} />
          </View>
        }
      />
      <TextField label={t("profile.email")} optional value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" ltr />
      <PickerField
        label={t("profile.birthDate")}
        optional
        helper={t("profile.birthDateNote")}
        icon="calendar"
        value={birthMs ? `${f.dayMonth(new Date(birthMs).toISOString())} ${f.number(new Date(birthMs).getFullYear())}` : ""}
        onPress={() => setPicking("date")}
      />
      <PickerField label={t("profile.area")} icon="map_pin" value={area ? t("home.areaWithCity", { area: area.name, city: area.city }) : ""} onPress={() => setPicking("area")} />

      <Button label={t("profile.save")} disabled={nameMissing} loading={update.isPending} onPress={() => void save()} style={styles.save} />
      <View style={styles.divider} />
      <Button label={t("profile.delete")} variant="dangerOutline" icon="trash" size="md" loading={remove.isPending} onPress={() => setDeleting(true)} />

      {picking === "date" && (
        // ponytail: Android = ديالوج النظام؛ iOS بيعرضه inline — يتراجع في فحص iOS (polish batch)
        <DateTimePicker
          value={new Date(birthMs ?? new Date(now.getFullYear() - 25, 0, 1, 12).getTime())}
          mode="date"
          minimumDate={new Date(now.getFullYear() - 90, 0, 1)}
          maximumDate={new Date(now.getFullYear() - 10, now.getMonth(), now.getDate())}
          onChange={(event, date) => {
            setPicking(null);
            if (event.type === "set" && date) setBirthDate(dayKey(date.getTime()));
          }}
        />
      )}
      <AreaSheet open={picking === "area"} onClose={() => setPicking(null)} areas={areas} selectedId={areaId} />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        icon="trash"
        title={t("profile.deleteDialog.title")}
        message={t("profile.deleteDialog.body")}
        confirmLabel={t("profile.deleteDialog.confirm")}
        cancelLabel={t("profile.deleteDialog.cancel")}
        onConfirm={() => {
          setDeleting(false);
          remove.mutateAsync().then(
            () => router.replace("/"),
            () => show(t("booking.errors.generic")),
          );
        }}
      />
    </>
  );
}

export default function ProfileScreen() {
  const t = useTranslations("mobile.screens");
  const user = useCurrentUser().data;
  // التوست برّه الـ scroll — جوّاه الـ absolute بيتحسب من آخر المحتوى
  const { toast, show } = useToast();
  return (
    <>
      <FormScreen header={<TopBar title={t("profile")} />}>
        {user ? <Form key={user.id} user={user} show={show} /> : <ActivityIndicator style={styles.loading} color={colors.teal} />}
      </FormScreen>
      {toast}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  loading: { marginTop: 48 },
  avatar: { alignItems: "center", gap: 10, paddingTop: 22, marginBottom: 24 },
  camera: { position: "absolute", bottom: -2, end: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.teal, borderWidth: 2.5, borderColor: colors.bg, alignItems: "center", justifyContent: "center" },
  names: { flexDirection: "row", gap: 10 },
  phoneHelper: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  picker: { flex: 1, alignSelf: "stretch", flexDirection: "row", alignItems: "center", gap: 10 },
  save: { marginTop: 8 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 22 },
});
