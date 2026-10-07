// الخدمات بالمجموعات: اسم + مدة + سعر + زرار (+ / ✓) بيضيف للحجز (فريم 21)
import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { GroupLabel } from "@/components/molecules/settings-group";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { SalonService, ServiceGroup } from "@/lib/types/salon";
import { bookingDraft, useBookingDraft } from "@/lib/utils/booking-draft";
import { colors } from "@/styles/tokens";

function ServiceRow({ salonId, service, selected, divider }: { salonId: string; service: SalonService; selected: boolean; divider: boolean }) {
  const t = useTranslations("mobile.salon");
  const tA11y = useTranslations("mobile.a11y");
  const f = useFormat();
  const toggle = () => bookingDraft.toggle(salonId, { id: service.id, name: service.name, durationMinutes: service.durationMinutes, price: service.price });
  const label = selected ? tA11y("removeService", { service: service.name }) : tA11y("addService", { service: service.name });
  return (
    <Pressable
      onPress={toggle}
      pressedScale={0.985}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label}، ${f.price(service.price)}`}
      style={[styles.row, divider && styles.divider]}
    >
      <View style={styles.flex}>
        <Text variant="bodyStrong">{service.name}</Text>
        <View style={styles.duration}>
          <Icon name="clock" size={13} color={colors.textSecondary} />
          <Text variant="meta">{t("duration", { n: f.number(service.durationMinutes) })}</Text>
        </View>
      </View>
      <Text variant="itemTitle" weight="extrabold" size={15}>
        {f.price(service.price)}
      </Text>
      <View style={[styles.toggle, selected && styles.toggleOn]}>
        <Icon name={selected ? "check_bold" : "plus"} size={18} color={selected ? colors.onPrimary : colors.primary} />
      </View>
    </Pressable>
  );
}

export function SalonServices({ salonId, groups }: { salonId: string; groups: ServiceGroup[] }) {
  const draft = useBookingDraft(salonId);
  return (
    <View style={styles.root}>
      {groups.map((g, gi) => (
        <Fragment key={g.title}>
          <View style={gi > 0 && styles.groupGap}>
            <GroupLabel>{g.title}</GroupLabel>
          </View>
          {g.services.map((s, i) => (
            <ServiceRow key={s.id} salonId={salonId} service={s} selected={draft.some((d) => d.id === s.id)} divider={i < g.services.length - 1} />
          ))}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: 16 },
  flex: { flex: 1 },
  groupGap: { marginTop: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 15 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  duration: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  toggle: { width: 34, height: 34, borderRadius: 9, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  toggleOn: { backgroundColor: colors.primary },
});
