// الحلاقين: كل واحد بدوره الخاص — اختيار حلاق بالاسم = طابور أطول ومكتوب قد إيه قبل الاختيار (فريم 22)
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Avatar } from "@/components/atoms/avatar";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Notice } from "@/components/molecules/notice";
import { WaitBadge } from "@/components/molecules/status-badges";
import { MetaBar } from "@/components/organs/salon-card";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { SalonBarber } from "@/lib/types/salon";
import { waitStatus } from "@/lib/utils/format/wait-status.utils";
import { colors } from "@/styles/tokens";
import { daysFromToday } from "../__lib/salon-labels";

type DayKey = "d0" | "d1" | "d2" | "d3" | "d4" | "d5" | "d6";

function BarberRow({ barber, live, now, divider }: { barber: SalonBarber; live: boolean; now: number; divider: boolean }) {
  const t = useTranslations("mobile.salon");
  const tDays = useTranslations("mobile.common.days");
  const tOffline = useTranslations("mobile.offline");
  const tLabels = useTranslations("mobile.salonLabels");
  const f = useFormat();
  const q = barber.queue;
  const off = q === null;

  let badge;
  if (!live) badge = <WaitBadge status="stale" label={tOffline("waitStale")} />;
  else if (off) {
    const ret = barber.returnsOn!;
    const day = daysFromToday(ret, now) === 1 ? tDays("tomorrow") : tDays(`d${new Date(ret).getDay()}` as DayKey);
    badge = <WaitBadge status="closed" label={t("barberOff", { day })} icon="clock" />;
  } else if (q.peopleAhead === 0) badge = <WaitBadge status="free" label={tLabels("freeNow")} icon="check" />;
  else badge = <WaitBadge status={waitStatus(q, true, true)} label={t("barberAhead", { n: f.count(q.peopleAhead), min: f.number(q.waitMinutes) })} icon="users" />;

  const meta = [barber.specialty];
  if (barber.yearsExperience !== null) meta.push(t("years", { count: barber.yearsExperience, n: f.count(barber.yearsExperience) }));

  return (
    <View style={[styles.row, divider && styles.divider, off && live && styles.off]}>
      <Avatar name={barber.name} size={52} tone="surface" />
      <View style={styles.main}>
        <View style={styles.nameRow}>
          <Text variant="itemTitle" size={15} numberOfLines={1} style={styles.shrink}>
            {barber.name}
          </Text>
          {barber.rating !== null && (
            <View style={styles.rating}>
              <Icon name="star_filled" size={14} color={off ? colors.textDisabled : colors.rating} />
              <Text dense variant="metaStrong" size={13}>
                {f.rating(barber.rating)}
              </Text>
              <Text dense variant="meta" size={12}>
                ({f.count(barber.reviewsCount)})
              </Text>
            </View>
          )}
        </View>
        <View style={styles.meta}>
          {meta.map((m, i) => (
            <View key={m} style={styles.metaItem}>
              {i > 0 && <MetaBar />}
              <Text dense variant="meta" numberOfLines={1}>
                {m}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.badge}>{badge}</View>
      </View>
    </View>
  );
}

export function SalonBarbers({ barbers, live, now }: { barbers: SalonBarber[]; live: boolean; now: number }) {
  const t = useTranslations("mobile.salon");
  return (
    <View style={styles.root}>
      {barbers.map((b, i) => (
        <BarberRow key={b.id} barber={b} live={live} now={now} divider={i < barbers.length - 1} />
      ))}
      <View style={styles.note}>
        <Notice>{t("barberNamedNote")}</Notice>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  off: { opacity: 0.6 },
  main: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  shrink: { flexShrink: 1 },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: 3 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 8, marginEnd: 8 },
  badge: { marginTop: 6 },
  note: { marginTop: 16 },
});
