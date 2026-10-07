// الاسم والتقييم والمنطقة، وحالة الطابور مثبّتة تحت الاسم مباشرة (فريم 21)، والاتجاهات/اتصل
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { WAIT_TONE } from "@/components/molecules/status-badges";
import { MetaBar, useSalonLabels } from "@/components/organs/salon-card";
import { callPhone, openDirections } from "@/lib/utils/external-links";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { SalonPage } from "@/lib/types/salon";
import { colors, radius, tone } from "@/styles/tokens";

export function SalonInfo({ page, live, now }: { page: SalonPage; live: boolean; now: number }) {
  const t = useTranslations("mobile.salon");
  const tCommon = useTranslations("mobile.common");
  const f = useFormat();
  const labels = useSalonLabels();
  const s = page.summary;
  const wait = labels.wait(s, live, now);
  const onShift = page.barbers.filter((b) => b.queue !== null).length;

  // فاضي = "فاضي دلوقتي — مفيش دور"، مقفول = "مقفول دلوقتي — بيفتح …"، غير كده نفس سطر الانتظار بتاع القوايم
  const title = wait.status === "free" ? t("freeNoQueue") : wait.status === "closed" ? `${t("closedNow")} — ${wait.label}` : wait.label;
  const subtitle =
    live && !s.opensAt
      ? tCommon("dot", { a: t("chairs", { count: page.chairsActive, n: f.count(page.chairsActive) }), b: t("barbersOnShift", { count: onShift, n: f.count(onShift) }) })
      : null;
  const c = tone[WAIT_TONE[wait.status]];

  return (
    <View style={styles.root}>
      <Text variant="titleXl" accessibilityRole="header">
        {s.name}
      </Text>
      <View style={styles.meta}>
        {s.rating !== null && (
          <View style={styles.rating}>
            <Icon name="star_filled" size={14} color={colors.rating} />
            <Text dense variant="metaStrong" size={13}>
              {f.rating(s.rating)}
            </Text>
            <Text dense variant="meta" size={12}>
              {t("reviewsWithCount", { count: s.reviewsCount, n: f.count(s.reviewsCount) })}
            </Text>
          </View>
        )}
        {s.rating !== null && <MetaBar />}
        <Text dense variant="meta">{s.areaName}</Text>
        <MetaBar />
        <Text dense variant="meta">{f.distance(s.distanceKm)}</Text>
      </View>

      <View style={[styles.status, { backgroundColor: c.background }]} accessible accessibilityLiveRegion="polite" accessibilityLabel={[title, subtitle].filter(Boolean).join("، ")}>
        <View style={[styles.dot, { backgroundColor: c.solid }]} />
        <View style={styles.flex}>
          <Text variant="body" weight="extrabold" color={c.foreground}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="meta" weight="semibold" color={c.foreground}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Button label={t("directions")} icon="navigation" variant="secondary" size="sm" style={styles.flex} onPress={() => openDirections(page.latitude, page.longitude, s.name)} />
        <Button label={t("call")} icon="phone" variant="secondary" size="sm" style={styles.flex} onPress={() => callPhone(page.phone)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: 16 },
  flex: { flex: 1 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 8 },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  status: { flexDirection: "row", alignItems: "center", gap: 11, borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 14, marginTop: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
});
