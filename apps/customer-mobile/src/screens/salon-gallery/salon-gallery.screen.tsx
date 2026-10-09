// معرض صور الصالون (فريم 39): مقسّم بالغرض مش بتاريخ الرفع — الفيديو فوق، شبكة عمودين بتتقفل على ٤ و"+N"، وصور التقييمات
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { Chip, ChipRail } from "@/components/molecules/chip";
import { GroupLabel } from "@/components/molecules/settings-group";
import { TopBar } from "@/components/molecules/top-bar";
import { SalonImage } from "@/components/organs/salon-card";
import { galleryPhoto } from "@/lib/data/salon-photos";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { useSalonPage } from "@/lib/hooks/salons";
import type { GalleryItem, GalleryKind } from "@/lib/types/salon";
import { colors, radius } from "@/styles/tokens";

const COLLAPSED_TILES = 4;

const openPhoto = (salonId: string, index: number, kind: GalleryKind | null) =>
  router.push({ pathname: "/salon/[salonId]/gallery/photo", params: { salonId, index: String(index), ...(kind ? { kind } : {}) } });

function Tile({ item, height, overlay, onPress }: { item: GalleryItem; height: number; overlay?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={overlay ?? item.caption ?? undefined} style={[styles.tile, { height }]}>
      <SalonImage source={galleryPhoto(item)} />
      {item.kind === "video" && !overlay && (
        <View style={styles.play}>
          <Icon name="play" size={height > 120 ? 24 : 18} color={colors.textPrimary} />
        </View>
      )}
      {overlay && (
        <View style={styles.overlay}>
          <Text variant="titleLg" size={19} weight="extrabold" color={colors.onPrimary}>
            {overlay}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function SalonGalleryScreen() {
  const t = useTranslations("mobile.gallery");
  const tSalon = useTranslations("mobile.salon");
  const tCommon = useTranslations("mobile.common");
  const f = useFormat();
  const { gutter, listMaxWidth } = useResponsive();
  const { salonId } = useLocalSearchParams<{ salonId: string }>();
  const page = useSalonPage(salonId).data;
  const [kind, setKind] = useState<GalleryKind | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (!page) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={[styles.body, { paddingHorizontal: gutter }]}>
          <TopBar close />
          <Skeleton height={196} radius={radius.card} />
        </View>
      </SafeAreaView>
    );
  }

  const all = page.gallery;
  const count = (k: GalleryKind | null) => (k ? all.filter((g) => g.kind === k).length : all.length);
  const photos = all.length - count("video");
  const videos = count("video");
  const items = kind ? all.filter((g) => g.kind === kind) : all;
  const video = items.find((g) => g.kind === "video");
  const tiles = items.filter((g) => g !== video);
  const visible = expanded || tiles.length <= COLLAPSED_TILES ? tiles : tiles.slice(0, COLLAPSED_TILES);
  const hidden = tiles.length - visible.length;
  const rows: GalleryItem[][] = [];
  for (let i = 0; i < visible.length; i += 2) rows.push(visible.slice(i, i + 2));
  const pick = (k: GalleryKind | null) => {
    setKind(k);
    setExpanded(false);
  };

  const filters: [GalleryKind | null, string][] = [
    [null, t("filterAll", { n: f.count(count(null)) })],
    ["work", t("filterWork", { n: f.count(count("work")) })],
    ["place", t("filterPlace", { n: f.count(count("place")) })],
    ["video", t("filterVideo", { n: f.count(count("video")) })],
  ];

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={[styles.content, { maxWidth: listMaxWidth }]}>
        <View style={{ paddingHorizontal: gutter }}>
          <TopBar
            close
            title={t("title", { salon: page.summary.name })}
            subtitle={tCommon("dot", { a: tSalon("photosCount", { count: photos, n: f.count(photos) }), b: t("videosCount", { count: videos, n: f.count(videos) }) })}
          />
        </View>
        <View style={styles.chips}>
          <ChipRail>
            {filters.map(([k, label]) => (
              <Chip key={label} label={label} kind={k === kind ? "selected" : "default"} onPress={() => pick(k)} />
            ))}
          </ChipRail>
        </View>
        <View style={[styles.body, { paddingHorizontal: gutter }]}>
          {video && (
            <View>
              <Tile item={video} height={196} onPress={() => openPhoto(salonId, items.indexOf(video), kind)} />
              {video.caption && (
                <View style={styles.videoBadge} pointerEvents="none">
                  <Icon name="play" size={14} color={colors.textSecondary} />
                  <Text dense variant="tag" color={colors.textSecondary}>
                    {tCommon("dot", { a: video.caption, b: f.ltr(`${Math.floor((video.durationSeconds ?? 0) / 60)}:${String((video.durationSeconds ?? 0) % 60).padStart(2, "0")}`) })}
                  </Text>
                </View>
              )}
            </View>
          )}
          {rows.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((g, ci) => {
                const last = ri * 2 + ci === visible.length - 1 && hidden > 0;
                return (
                  <View key={g.id} style={styles.cell}>
                    <Tile item={g} height={130} overlay={last ? f.ltr(t("more", { n: String(hidden + 1) })) : undefined} onPress={last ? () => setExpanded(true) : () => openPhoto(salonId, items.indexOf(g), kind)} />
                  </View>
                );
              })}
              {row.length === 1 && <View style={styles.cell} />}
            </View>
          ))}
          {page.reviewPhotos.length > 0 && !kind && (
            <View style={styles.reviewPhotos}>
              <GroupLabel>{t("reviewPhotos")}</GroupLabel>
              <View style={styles.reviewRow}>
                {page.reviewPhotos.map((g) => (
                  <View key={g.id} style={styles.small}>
                    <SalonImage source={galleryPhoto(g)} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { width: "100%", alignSelf: "center", paddingBottom: 24 },
  chips: { marginTop: 14, marginBottom: 4 },
  body: { paddingTop: 14, gap: 10 },
  tile: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surf, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  play: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim, alignItems: "center", justifyContent: "center" },
  videoBadge: { position: "absolute", bottom: 10, start: 12, flexDirection: "row", alignItems: "center", gap: 5, height: 26, paddingHorizontal: 9, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
  row: { flexDirection: "row", gap: 10 },
  cell: { flex: 1 },
  reviewPhotos: { marginTop: 10 },
  reviewRow: { flexDirection: "row", gap: 10 },
  small: { width: 96, height: 96, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surf, overflow: "hidden" },
});
