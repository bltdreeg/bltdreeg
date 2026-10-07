// عارض الصور (Flutter فقط — من المعرض): صفحات بالسحب على خلفية غامقة + عدّاد "٢ / ١٣" + قفل
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { TopBar } from "@/components/molecules/top-bar";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useSalonPage } from "@/lib/hooks/salons";
import type { GalleryKind } from "@/lib/types/salon";
import { colors } from "@/styles/tokens";

const VIEWABILITY = { itemVisiblePercentThreshold: 60 };

export default function SalonPhotoScreen() {
  const t = useTranslations("mobile.gallery");
  const f = useFormat();
  const { width } = useWindowDimensions();
  const { salonId, index = "0", kind } = useLocalSearchParams<{ salonId: string; index?: string; kind?: GalleryKind }>();
  const gallery = useSalonPage(salonId).data?.gallery ?? [];
  const items = kind ? gallery.filter((g) => g.kind === kind) : gallery;
  const start = Math.min(Number(index) || 0, Math.max(0, items.length - 1));
  const [current, setCurrent] = useState(start);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.bar}>
        <TopBar
          close
          trailing={
            items.length > 0 ? (
              <Text variant="label" color={colors.onPrimary}>
                {t("counter", { index: f.count(current + 1), total: f.count(items.length) })}
              </Text>
            ) : undefined
          }
        />
      </View>
      {/* بتتعمل بعد ما الصور توصل، عشان initialScrollIndex يتطبق */}
      {items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(g) => g.id}
          horizontal
          // ponytail: Android RTL بيعكس الـ offsets ومابيحترمش initialScrollIndex → الليستة LTR (السحب شمال = اللي بعده). GAPS §2e
          style={styles.ltr}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={start}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          viewabilityConfig={VIEWABILITY}
          onViewableItemsChanged={({ viewableItems }) => {
            const i = viewableItems[0]?.index;
            if (i != null) setCurrent(i);
          }}
          renderItem={({ item }) => (
            <View style={[styles.page, { width }]}>
              <View style={styles.photo}>
                <Icon name={item.kind === "video" ? "play" : "camera"} size={56} color={colors.textSecondary} />
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.tx },
  bar: { paddingHorizontal: 16 },
  ltr: { direction: "ltr" },
  page: { alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", aspectRatio: 3 / 4, alignItems: "center", justifyContent: "center" },
});
