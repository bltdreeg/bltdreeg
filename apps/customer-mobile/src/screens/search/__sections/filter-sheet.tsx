// فلترة وترتيب (فريم 14): الترتيب اختيار واحد، الخدمة متعدد، التاريخ صف سريع بدل تقويم، السعر بمقبضين، ومفتوح دلوقتي.
// بيعدّل نسخة وبيرجعها بـ "اعرض N نتايج" (العدد قبل التطبيق) — زي showFilterSheet في Flutter. بيتعمل mount مع كل فتح.
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Toggle } from "@/components/atoms/selection-controls";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { Chip, DateChip } from "@/components/molecules/chip";
import { RangeSlider } from "@/components/molecules/range-slider";
import { GroupLabel } from "@/components/molecules/settings-group";
import { Sheet } from "@/components/organs/sheet";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { ServiceKind } from "@/lib/types/salon";
import { activeFilterCount, PRICE_CEILING, PRICE_FLOOR, withoutFilters, type SearchCriteria } from "@/lib/utils/salons/salon-matcher";
import type { SalonSort } from "@/lib/utils/salons/salon-sort.utils";
import { colors } from "@/styles/tokens";
import { dayMs, nextDays } from "@/lib/utils/day-keys";

export const SORTS: SalonSort[] = ["leastWait", "nearest", "topRated", "cheapest", "newest"];
export const SERVICES: ServiceKind[] = ["haircut", "beard", "kids", "color", "skincare"];

interface Props {
  initial: SearchCriteria;
  countFor: (draft: SearchCriteria) => number;
  onApply: (criteria: SearchCriteria) => void;
  onClose: () => void;
}

export function FilterSheet({ initial, countFor, onApply, onClose }: Props) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const [draft, setDraft] = useState(initial);
  const [now] = useState(Date.now);
  const set = (patch: Partial<SearchCriteria>) => setDraft((d) => ({ ...d, ...patch }));
  const count = countFor(draft);
  const days = nextDays(now).slice(0, 4);

  return (
    <Sheet
      open
      onClose={onClose}
      title={t("search.filter")}
      footer={
        <View style={styles.footer}>
          <Button label={t("search.clearAll")} variant="secondary" style={styles.clear} disabled={activeFilterCount(draft) === 0} onPress={() => setDraft(withoutFilters(draft))} />
          <Button label={t("search.showResults", { count, n: f.count(count) })} style={styles.flex} onPress={() => onApply(draft)} />
        </View>
      }
    >
      <GroupLabel>{t("search.sortBy")}</GroupLabel>
      <View style={styles.wrap}>
        {SORTS.map((s) => (
          <Chip key={s} label={t(`sort.${s}`)} kind={draft.sort === s ? "selected" : "default"} onPress={() => set({ sort: draft.sort === s ? null : s })} />
        ))}
      </View>

      <GroupLabel>{t("search.service")}</GroupLabel>
      <View style={styles.wrap}>
        {SERVICES.map((k) => {
          const on = draft.services.includes(k);
          return <Chip key={k} label={t(`search.services.${k}`)} kind={on ? "selected" : "default"} icon={on ? "check" : undefined} onPress={() => set({ services: on ? draft.services.filter((x) => x !== k) : [...draft.services, k] })} />;
        })}
      </View>

      <GroupLabel>{t("search.availableOn")}</GroupLabel>
      <View style={styles.days}>
        {days.map((d, i) => {
          const iso = new Date(dayMs(d)).toISOString();
          return (
            <DateChip
              key={d}
              top={i === 0 ? t("booking.slot.today") : i === 1 ? t("booking.slot.tomorrow") : f.weekday(iso)}
              bottom={f.number(new Date(dayMs(d)).getDate())}
              selected={draft.day === d}
              onPress={() => set({ day: draft.day === d ? null : d })}
            />
          );
        })}
      </View>

      <GroupLabel>{t("search.price")}</GroupLabel>
      <View style={styles.prices}>
        <Text dense variant="metaStrong">{f.price(draft.minPrice)}</Text>
        <Text dense variant="metaStrong">{f.price(draft.maxPrice)}</Text>
      </View>
      <RangeSlider
        min={PRICE_FLOOR}
        max={PRICE_CEILING}
        step={5}
        low={draft.minPrice}
        high={draft.maxPrice}
        onChange={(minPrice, maxPrice) => set({ minPrice, maxPrice })}
        format={f.price}
        accessibilityLabel={t("search.price")}
      />

      <View style={styles.openNow}>
        <View style={styles.flex}>
          <Text variant="bodyStrong">{t("search.openNow")}</Text>
          <Text dense variant="caption">
            {t("search.openNowHint")}
          </Text>
        </View>
        <Toggle value={draft.openNowOnly} onValueChange={(openNowOnly) => set({ openNowOnly })} accessibilityLabel={t("search.openNow")} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  days: { flexDirection: "row", gap: 8, marginBottom: 20 },
  prices: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
  openNow: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: colors.line, marginTop: 18, paddingTop: 16 },
  footer: { flexDirection: "row", gap: 10 },
  clear: { minWidth: 118 },
});
