// "ادخل الطابور" ثابت تحت مع عدد الخدمات والسعر المتوقع — قرار الحجز من غير سكرول (فريم 21)
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { useBookingDraft } from "@/lib/utils/booking-draft";
import { colors, shadow } from "@/styles/tokens";
import { draftTotal } from "../__lib/salon-labels";

export function BookingBar({ salonId, live }: { salonId: string; live: boolean }) {
  const t = useTranslations("mobile.salon");
  const f = useFormat();
  const insets = useSafeAreaInsets();
  const { gutter } = useResponsive();
  const draft = useBookingDraft(salonId);
  const count = draft.length;
  // الخطوة ١ "امتى تحب تيجي؟" (Flutter، GAPS D7) — دلوقتي أو ميعاد
  const join = () => router.push({ pathname: "/salon/[salonId]/book/slot", params: { salonId } });

  return (
    <View style={[styles.root, { paddingHorizontal: gutter, paddingBottom: insets.bottom + 12 }]}>
      <View>
        <Text variant="caption" weight="semibold">
          {t("selection", { count, n: f.count(count) })}
        </Text>
        {count > 0 && (
          <Text variant="titleMd" size={17}>
            {f.price(draftTotal(draft))}
          </Text>
        )}
      </View>
      <Button label={t("joinQueue")} onPress={join} disabled={count === 0 || !live} style={styles.flex} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg, ...shadow.float },
  flex: { flex: 1 },
});
