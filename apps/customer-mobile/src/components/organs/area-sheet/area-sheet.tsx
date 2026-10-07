// اختيار المنطقة (فريم 40): بحث، "استخدم موقعي الحالي" أول اختيار، المناطق القريبة ثم الباقي، "أكّد المنطقة"
import * as Location from "expo-location";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { ListGroup, ListRow } from "@/components/molecules/settings-group";
import { SearchField } from "@/components/molecules/text-field";
import { useToast } from "@/components/molecules/toast";
import { Sheet } from "@/components/organs/sheet";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { Area } from "@/lib/types/area/area.interface";
import { appPreferences } from "@/lib/utils/app-preferences";
import { normalizeArabic } from "@/lib/utils/salons/arabic-normalize.utils";
import { colors, radius } from "@/styles/tokens";

interface Props {
  open: boolean;
  onClose: () => void;
  areas: Area[];
  selectedId: string;
}

export function AreaSheet({ open, onClose, areas, selectedId }: Props) {
  const t = useTranslations("mobile.area");
  const f = useFormat();
  // التوست جوّه الـ sheet (Modal) — توست الشاشة بيبقى تحته
  const { toast, show } = useToast();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const current = picked ?? selectedId;

  const close = () => {
    setQuery("");
    setPicked(null);
    onClose();
  };

  const q = normalizeArabic(query);
  const shown = areas.filter((a) => normalizeArabic(a.name).includes(q));
  const nearby = shown.filter((a) => a.isNearby);
  const others = shown.filter((a) => !a.isNearby);

  const locate = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    // ponytail: بنختار أول منطقة قريبة — تحديد المنطقة من الإحداثيات لما الباك إند يبقى عنده حدود المناطق
    const near = granted && areas.find((a) => a.isNearby);
    if (!near) return;
    setPicked(near.id);
    show(t("located", { area: near.name }));
  };

  const confirm = () => {
    appPreferences.setSelectedArea(current);
    close();
  };

  const row = (a: Area) => (
    <ListRow
      key={a.id}
      icon="map_pin"
      title={a.name}
      subtitle={t("salonsCount", { count: a.shopCount, n: f.count(a.shopCount) })}
      onPress={() => setPicked(a.id)}
      trailing={a.id === current && <Icon name="check" size={18} color={colors.teal} />}
    />
  );

  return (
    <Sheet open={open} onClose={close} title={t("title")} footer={
        <>
          <Button label={t("confirm")} onPress={confirm} />
          {toast}
        </>
      }>
      <View style={styles.search}>
        <SearchField inSheet value={query} onChangeText={setQuery} placeholder={t("searchHint")} />
      </View>
      <Pressable onPress={locate} accessibilityLabel={`${t("useLocation")}، ${t("useLocationHint")}`} pressedScale={0.99} style={styles.location}>
        <Icon name="navigation" size={20} color={colors.tealDark} />
        <View style={styles.flex}>
          <Text variant="body" weight="extrabold" color={colors.tealDark}>
            {t("useLocation")}
          </Text>
          <Text variant="caption" size={12.5} weight="semibold" color={colors.tealDark}>
            {t("useLocationHint")}
          </Text>
        </View>
      </Pressable>
      {nearby.length > 0 && <ListGroup label={t("nearby")}>{nearby.map(row)}</ListGroup>}
      {others.length > 0 && <ListGroup label={t("others", { city: others[0].city })}>{others.map(row)}</ListGroup>}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: { marginBottom: 16 },
  location: { flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1.5, borderColor: colors.teal, backgroundColor: colors.tealTint, borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 14, marginBottom: 18 },
});
