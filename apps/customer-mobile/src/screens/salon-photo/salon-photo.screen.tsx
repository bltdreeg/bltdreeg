// عارض الصور (Flutter فقط — من المعرض): صفحات بالسحب على خلفية غامقة + عدّاد "٢ / ١٣" + قفل.
// السحب بـ useSwipePager (زي الأونبوردنج): في RTL السحب يمين = اللي بعده.
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { TopBar } from "@/components/molecules/top-bar";
import { SalonImage } from "@/components/organs/salon-card";
import { galleryPhoto } from "@/lib/data/salon-photos";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useSalonPage } from "@/lib/hooks/salons";
import { useSwipePager } from "@/lib/hooks/use-swipe-pager.hook";
import type { GalleryItem, GalleryKind } from "@/lib/types/salon";
import { colors } from "@/styles/tokens";

export default function SalonPhotoScreen() {
  const { salonId, index = "0", kind } = useLocalSearchParams<{ salonId: string; index?: string; kind?: GalleryKind }>();
  const gallery = useSalonPage(salonId).data?.gallery ?? [];
  const items = kind ? gallery.filter((g) => g.kind === kind) : gallery;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {/* بيتعمل بعد ما الصور توصل، عشان الصفحة الأولى تبقى الصورة اللي اتداس عليها */}
      {items.length > 0 ? (
        <Pager items={items} start={Math.min(Number(index) || 0, items.length - 1)} />
      ) : (
        <View style={styles.bar}>
          <TopBar close />
        </View>
      )}
    </SafeAreaView>
  );
}

function Pager({ items, start }: { items: GalleryItem[]; start: number }) {
  const t = useTranslations("mobile.gallery");
  const f = useFormat();
  const { width } = useWindowDimensions();
  const { page, pan, track } = useSwipePager(items.length, width, start);

  return (
    <>
      <View style={styles.bar}>
        <TopBar
          close
          trailing={
            <Text variant="label" color={colors.onPrimary}>
              {t("counter", { index: f.count(page + 1), total: f.count(items.length) })}
            </Text>
          }
        />
      </View>
      <GestureDetector gesture={pan}>
        <View style={styles.viewport}>
          <Animated.View style={[styles.track, { width: width * items.length }, track]}>
            {items.map((item, i) => (
              <View key={item.id} style={[styles.page, { width }]} accessibilityElementsHidden={i !== page} importantForAccessibility={i === page ? "auto" : "no-hide-descendants"}>
                {/* ponytail: كل الصور بتترسم (≤ ٢٠ في المعرض)؛ لو المعرض كبر نرسم الصفحة واللي جنبها بس */}
                <View style={styles.photo}>
                  {/* ponytail: الفيديو بيبان صورة + زرار تشغيل لحد ما يبقى فيه فيديو حقيقي من الـ API */}
                  <SalonImage source={galleryPhoto(item)} fit="contain" />
                  {item.kind === "video" && <Icon name="play" size={56} color={colors.onPrimary} />}
                </View>
              </View>
            ))}
          </Animated.View>
        </View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.tx },
  bar: { paddingHorizontal: 16 },
  viewport: { flex: 1, overflow: "hidden" },
  track: { flex: 1, flexDirection: "row" },
  page: { alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", aspectRatio: 3 / 4, alignItems: "center", justifyContent: "center" },
});
