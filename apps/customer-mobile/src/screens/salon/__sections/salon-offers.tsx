// "عروض شغّالة دلوقتي" (فريم 22): الخصم الشغّال بإطار متقطع تركوازي، الباقة بالسعر القديم مشطوب، الولاء بنقط التقدم
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { SectionHeader } from "@/components/molecules/top-bar";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { SalonOffer } from "@/lib/types/offer/offer.interface";
import { colors, radius } from "@/styles/tokens";
import { daysFromToday } from "../__lib/salon-labels";

function OfferCard({ offer, now }: { offer: SalonOffer; now: number }) {
  const t = useTranslations("mobile.salon");
  const f = useFormat();
  const hi = !!offer.highlighted;
  const fg = hi ? colors.tealDark : colors.textSecondary;
  const days = offer.expiresAt ? Math.max(0, daysFromToday(offer.expiresAt, now)) : null;

  return (
    <View style={[styles.card, hi && styles.cardHi]}>
      <Icon name="gift" size={24} color={fg} />
      <View style={styles.flex}>
        <Text variant="body" weight="extrabold" color={hi ? colors.tealDark : colors.textPrimary}>
          {f.digits(offer.title)}
        </Text>
        {offer.description && (
          <Text variant="meta" weight="semibold" color={fg} style={styles.line}>
            {f.digits(offer.description)}
          </Text>
        )}
        {offer.kind === "bundle" && offer.originalPrice !== undefined && offer.price !== undefined && (
          <Text variant="meta" weight="semibold" style={styles.line}>
            {t.rich("bundleSaving", {
              original: f.price(offer.originalPrice),
              saving: f.price(offer.originalPrice - offer.price),
              s: (chunks) => <Text variant="meta" weight="semibold" style={styles.strike}>{chunks}</Text>,
            })}
          </Text>
        )}
        {offer.kind === "loyalty" && offer.visitsDone !== undefined && offer.visitsTarget !== undefined && (
          <>
            <Text variant="meta" weight="semibold" style={styles.line}>
              {t("loyaltyProgress", { done: f.count(offer.visitsDone), target: f.count(offer.visitsTarget) })}
            </Text>
            <View style={styles.dots} accessible={false}>
              {Array.from({ length: offer.visitsTarget }, (_, i) => (
                <View key={i} style={[styles.dot, i < offer.visitsDone! && styles.dotOn]} />
              ))}
            </View>
          </>
        )}
        {days !== null && (
          <Text variant="caption" color={fg} style={styles.expiry}>
            {t("offerExpires", { count: days, n: f.count(days) })}
          </Text>
        )}
      </View>
    </View>
  );
}

export function SalonOffers({ offers, now }: { offers: SalonOffer[]; now: number }) {
  const t = useTranslations("mobile.salon");
  return (
    <View>
      <SectionHeader title={t("offersHeader")} style={styles.header} />
      <View style={styles.list}>
        {offers.map((o) => (
          <OfferCard key={o.id} offer={o} now={now} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { marginTop: 0 },
  list: { gap: 10 },
  card: { flexDirection: "row", gap: 12, padding: 14, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line },
  cardHi: { borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.teal, backgroundColor: colors.tealTint },
  line: { marginTop: 3 },
  strike: { textDecorationLine: "line-through" },
  expiry: { marginTop: 6 },
  dots: { flexDirection: "row", gap: 5, marginTop: 9 },
  dot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.line },
  dotOn: { backgroundColor: colors.teal },
});
