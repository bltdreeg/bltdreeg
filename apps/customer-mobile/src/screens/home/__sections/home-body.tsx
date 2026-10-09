// محتوى الرئيسية: HomeLive (فريم 07 — الفاضي دلوقتي قبل التقييم) و HomeOffline (فريم 08 — أرقام الانتظار مستخبية لأنها بتكدب)
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { Chip, ChipRail } from "@/components/molecules/chip";
import { Notice } from "@/components/molecules/notice";
import { SectionDivider, SectionHeader } from "@/components/molecules/top-bar";
import { SalonListItem, SalonRailCard } from "@/components/organs/salon-card";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { SalonSummary } from "@/lib/types/salon";
import type { SalonSort } from "@/lib/utils/salons/salon-sort.utils";
import { useRecentlyViewed } from "@/lib/utils/recently-viewed";
import { colors, radius } from "@/styles/tokens";
import { homeSections } from "../__lib/home-sections";

const CHIP_SORTS: SalonSort[] = ["leastWait", "nearest", "topRated", "cheapest"];

function SearchEntry({ disabled }: { disabled?: boolean }) {
  const t = useTranslations("mobile.home");
  const tOffline = useTranslations("mobile.offline");
  const { gutter } = useResponsive();
  const label = disabled ? tOffline("searchDisabled") : t("searchHint");
  return (
    <View style={{ paddingHorizontal: gutter }}>
      <Pressable onPress={() => router.navigate("/search")} disabled={disabled} accessibilityLabel={label} pressedScale={0.99} style={[styles.search, disabled && styles.searchOff]}>
        <Icon name="search" size={18} color={colors.textSecondary} />
        <Text variant="input" weight="medium" color={colors.textDisabled} numberOfLines={1} style={styles.flex}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

function SortChips({ value, onChange }: { value?: SalonSort; onChange?: (s: SalonSort) => void }) {
  const t = useTranslations("mobile.sort");
  return (
    <View style={[styles.chips, !onChange && styles.chipsOff]}>
      <ChipRail>
        {CHIP_SORTS.map((s, i) => (
          <Chip key={s} label={t(s)} icon={i === 0 && value ? "clock" : undefined} kind={s === value ? "selected" : "default"} onPress={onChange && (() => onChange(s))} />
        ))}
      </ChipRail>
    </View>
  );
}

function Rail({ salons, now, newBadge }: { salons: SalonSummary[]; now: number; newBadge?: boolean }) {
  const { gutter } = useResponsive();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.rail, { paddingHorizontal: gutter }]}>
      {salons.map((s) => (
        <SalonRailCard key={s.id} salon={s} now={now} showNewBadge={newBadge} />
      ))}
    </ScrollView>
  );
}

const List = ({ salons, now, live }: { salons: SalonSummary[]; now: number; live?: boolean }) =>
  salons.map((s, i) => <SalonListItem key={s.id} salon={s} now={now} live={live} divider={i < salons.length - 1} />);

interface Props {
  salons: SalonSummary[];
  now: number;
}

export function HomeLive({ salons, now, sort, onSort }: Props & { sort: SalonSort; onSort: (s: SalonSort) => void }) {
  const t = useTranslations("mobile.home");
  const { gutter } = useResponsive();
  const { availableNow, recommended, newInArea } = homeSections(salons, sort, now);
  const seeAll = (params: Record<string, string>) => () => router.navigate({ pathname: "/search", params });

  return (
    <>
      <SearchEntry />
      <SortChips value={sort} onChange={onSort} />
      {availableNow.length > 0 && (
        <>
          <View style={{ paddingHorizontal: gutter }}>
            <SectionHeader title={t("availableNow")} action={t("seeAll")} onAction={seeAll({ sort: "leastWait", open: "1" })} style={styles.railHeader} />
          </View>
          <Rail salons={availableNow} now={now} />
          <SectionDivider />
        </>
      )}
      <View style={{ paddingHorizontal: gutter }}>
        <SectionHeader title={t("recommended")} action={t("seeAll")} onAction={seeAll({ sort })} style={availableNow.length > 0 && styles.afterDivider} />
        <List salons={recommended} now={now} />
      </View>
      {newInArea.length > 0 && (
        <>
          <SectionDivider />
          <View style={{ paddingHorizontal: gutter }}>
            <SectionHeader title={t("newInArea")} action={t("seeAll")} onAction={seeAll({ sort: "newest" })} style={styles.afterDivider} />
          </View>
          <Rail salons={newInArea} now={now} newBadge />
          <View style={styles.end} />
        </>
      )}
    </>
  );
}

export function HomeOffline({ salons, now }: Props) {
  const t = useTranslations("mobile.home");
  const tOffline = useTranslations("mobile.offline");
  const { gutter } = useResponsive();
  const recentIds = useRecentlyViewed();
  return (
    <>
      <SearchEntry disabled />
      <SortChips />
      <View style={{ paddingHorizontal: gutter }}>
        <SectionHeader title={t("lastSeen")} />
        <List salons={homeSections(salons, "nearest", now, recentIds).lastSeen} now={now} live={false} />
        <View style={styles.notice}>
          <Notice>{tOffline("queueBlocked")}</Notice>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: { height: 50, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, borderRadius: radius.field, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surf },
  searchOff: { opacity: 0.55 },
  chips: { marginTop: 14, marginBottom: 4 },
  chipsOff: { opacity: 0.5 },
  rail: { gap: 12, paddingTop: 2, paddingBottom: 4 },
  notice: { marginTop: 18 },
  railHeader: { marginBottom: 10 },
  afterDivider: { marginTop: 0 },
  end: { height: 18 },
});
