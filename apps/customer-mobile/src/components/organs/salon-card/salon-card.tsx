// كروت الصالون: SalonRailCard (.hcard — الشرايط الأفقية) و SalonListItem (.shop — القوايم) + useSalonLabels.
// الرئيسية والبحث والمفضلة بيستخدموهم — نصوص الحالة من مكان واحد (salon_labels.dart في Flutter).
import { router } from "expo-router";
import { Fragment, type ReactElement, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { getLocale } from "@/i18n/config";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { Rating } from "@/components/molecules/rating";
import { Badge, StatusPin, WaitBadge } from "@/components/molecules/status-badges";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { WaitStatus } from "@/lib/types/queue";
import type { SalonSummary } from "@/lib/types/salon";
import { waitStatus } from "@/lib/utils/format/wait-status.utils";
import { isOpen } from "@/lib/utils/salons/salon-sort.utils";
import { colors, radius } from "@/styles/tokens";
import { duration } from "@/theme/motion";

const DAY_MS = 86_400_000;
/** اسم الصالون زي ما صاحبه كاتبه ("Barber Point دجلة"): علامة اتجاه في الأول عشان الفقرة تمشي باتجاه الواجهة
 *  مش باتجاه أول حرف (Android بيتجاهل writingDirection) — زي البورد و Flutter */
const RLM = String.fromCharCode(0x200f);
const LRM = String.fromCharCode(0x200e);
/** اسم الصالون بيبدأ باتجاه اللغة (RLM) — وإلا اسم لاتيني بيقلب السطر */
export const salonName = (name: string) => (getLocale() === "ar" ? RLM : LRM) + name;
const startOfDay = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

export function useSalonLabels() {
  const t = useTranslations("mobile.salonLabels");
  const tOffline = useTranslations("mobile.offline");
  const f = useFormat();

  return {
    /** النص فوق صورة الكارت الأفقي: "فاضي دلوقتي" / "فاضل ١ بس" */
    pin(s: SalonSummary): { status: WaitStatus; label: string } {
      const ahead = s.queue.peopleAhead;
      return { status: waitStatus(s.queue, isOpen(s), true), label: ahead === 0 ? t("freeNow") : t("pinLeft", { count: ahead, n: f.count(ahead) }) };
    },
    /** سطر الانتظار تحت اسم الصالون. من غير نت الأرقام بتتخفي لأنها بتكدب (فريم 08) */
    wait(s: SalonSummary, live: boolean, now: number): { status: WaitStatus; label: string; icon: IconName } {
      if (!live) return { status: "stale", label: tOffline("waitStale"), icon: "wifi_off" };
      if (s.opensAt) {
        const days = Math.round((startOfDay(Date.parse(s.opensAt)) - startOfDay(now)) / DAY_MS);
        const time = f.hour(s.opensAt);
        const label = days <= 0 ? t("opensToday", { time }) : days === 1 ? t("opensTomorrow", { time }) : t("opensOn", { day: f.weekday(s.opensAt), time });
        return { status: "closed", label, icon: "clock" };
      }
      const { peopleAhead: ahead, waitMinutes } = s.queue;
      const status = waitStatus(s.queue, true, true);
      if (ahead === 0) return { status, label: t("freeWalkIn"), icon: "check" };
      const args = { count: ahead, n: f.count(ahead), min: f.number(waitMinutes) };
      return { status, label: waitMinutes >= 55 ? t("peopleHour", args) : t("peopleMinutes", args), icon: "users" };
    },
    /** "فتح من أسبوعين" */
    openedAgo(iso: string, now: number): string {
      const days = Math.floor((now - Date.parse(iso)) / DAY_MS);
      if (days < 7) return t("openedDays", { count: days, n: f.count(days) });
      const weeks = Math.round(days / 7);
      return t("openedWeeks", { count: weeks, n: f.count(weeks) });
    },
  };
}

/** صف معلومات بفواصل رأسية (.meta): المعادي | ٠.٨ كم | من ٧٠ ج.م — النص بيتقص، الـ element بيفضل زي ما هو. مش "·": جنب ٠ بتتقري صفر */
/** الفاصل الرفيع بين أجزاء سطر البيانات (البورد .meta .bar) — مكان "·" اللي بيلزق في الأرقام */
export const MetaBar = ({ color }: { color?: string }) => <View style={[styles.bar, color && { backgroundColor: color }]} />;

export function Meta({ items, barColor, style }: { items: (string | ReactElement)[]; barColor?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.meta, style]}>
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <MetaBar color={barColor} />}
          {typeof item === "string" ? (
            <Text dense variant="meta" numberOfLines={1} style={styles.shrink}>
              {item}
            </Text>
          ) : (
            item
          )}
        </Fragment>
      ))}
    </View>
  );
}

/** "من ٧٠ ج.م"، أو "قصة شعر ٩٠ ج.م" لما البحث متفلتر بخدمة واحدة */
function PriceFrom({ amount, label }: { amount: number; label?: string }) {
  const t = useTranslations("mobile.salonLabels");
  const f = useFormat();
  return (
    <Text dense variant="meta" numberOfLines={1}>
      {label ?? t("from")}{" "}
      <Text dense variant="metaStrong" color={colors.textPrimary}>
        {f.price(amount)}
      </Text>
    </Text>
  );
}

const openSalon = (id: string) => router.push({ pathname: "/salon/[salonId]", params: { salonId: id } });

interface RailProps {
  salon: SalonSummary;
  now: number;
  /** "جديد في منطقتك": بادج "فتح من…" مكان التقييم */
  showNewBadge?: boolean;
}

export function SalonRailCard({ salon, now, showNewBadge }: RailProps) {
  const labels = useSalonLabels();
  const f = useFormat();
  const pin = labels.pin(salon);
  return (
    <Pressable onPress={() => openSalon(salon.id)} accessibilityLabel={`${salon.name}، ${pin.label}`} style={styles.card}>
      <View style={styles.cardImage}>
        <Icon name="store" size={28} color={colors.placeholderIcon} />
        <Animated.View key={pin.label} entering={FadeIn.duration(duration.medium)} style={styles.pin}>
          <StatusPin status={pin.status} label={pin.label} />
        </Animated.View>
      </View>
      <View style={styles.cardBody}>
        <Text variant="itemTitle" size={14.5} numberOfLines={1}>
          {salonName(salon.name)}
        </Text>
        <Meta items={[salon.areaName, f.distance(salon.distanceKm)]} />
        <View style={styles.cardBottom}>
          {showNewBadge ? <Badge label={labels.openedAgo(salon.openedOn, now)} /> : salon.rating !== null ? <Rating value={salon.rating} count={salon.reviewsCount} /> : <View />}
          <PriceFrom amount={salon.priceFrom} />
        </View>
      </View>
    </Pressable>
  );
}

interface ItemProps {
  salon: SalonSummary;
  now: number;
  /** false = من غير نت: الانتظار "مش متحدّث" بدل الأرقام */
  live?: boolean;
  divider?: boolean;
  /** سعر خدمة بعينها بدل "من" (البحث بخدمة واحدة — فريم 13) */
  price?: { label: string; amount: number };
  /** زرار تحت سطر الانتظار (المفضلة — فريم 34) */
  action?: ReactNode;
}

export function SalonListItem({ salon, now, live = true, divider = true, price, action }: ItemProps) {
  const labels = useSalonLabels();
  const f = useFormat();
  const wait = labels.wait(salon, live, now);
  return (
    <Pressable
      onPress={() => openSalon(salon.id)}
      accessibilityLabel={`${salon.name}، ${salon.areaName}، ${f.distance(salon.distanceKm)}، ${wait.label}`}
      pressedScale={0.99}
      style={[styles.row, divider && styles.rowDivider]}
    >
      <View style={styles.thumb}>
        <Icon name="store" size={26} color={colors.placeholderIcon} />
      </View>
      <View style={styles.rowMain}>
        <View style={styles.nameRow}>
          <Text variant="itemTitle" numberOfLines={1} style={styles.shrink}>
            {salonName(salon.name)}
          </Text>
          {salon.rating !== null && <Rating value={salon.rating} count={salon.reviewsCount} />}
        </View>
        <Meta items={[salon.areaName, f.distance(salon.distanceKm), <PriceFrom key="price" amount={price?.amount ?? salon.priceFrom} label={price?.label} />]} />
        <Animated.View key={wait.label} entering={FadeIn.duration(duration.medium)} style={styles.waitWrap}>
          <WaitBadge status={wait.status} label={wait.label} icon={wait.icon} />
        </Animated.View>
        {action}
      </View>
    </Pressable>
  );
}

export const RAIL_CARD_WIDTH = 218;

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 },
  bar: { width: 1, height: 11, backgroundColor: colors.line },
  card: { width: RAIL_CARD_WIDTH, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, overflow: "hidden", backgroundColor: colors.bg },
  cardImage: { height: 104, backgroundColor: colors.surf, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: colors.line },
  pin: { position: "absolute", top: 8, start: 8 },
  cardBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, gap: 6 },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  row: { flexDirection: "row", gap: 12, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  thumb: { width: 86, height: 86, borderRadius: radius.md, backgroundColor: colors.surf, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  rowMain: { flex: 1, minWidth: 0, gap: 5, paddingTop: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  waitWrap: { alignSelf: "flex-start", maxWidth: "100%" },
});

/** صورة الصالون المصغّرة في الحجز والطابور (.thumb ٤٨–٥٨) */
export function SalonThumb({ size }: { size: number }) {
  return (
    <View style={[styles.thumb, { width: size, height: size, borderRadius: size > 50 ? 11 : 10 }]}>
      <Icon name="store" size={20} color={colors.placeholderIcon} />
    </View>
  );
}
