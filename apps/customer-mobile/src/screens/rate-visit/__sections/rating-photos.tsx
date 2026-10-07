// صور التقييم (فريم 31): لحد ٣، كل واحدة بـ × للشيل، والإضافة من الكاميرا أو الصور (شيت زي Flutter)
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Button } from "@/components/molecules/button";
import { ListGroup, ListRow } from "@/components/molecules/settings-group";
import { Sheet } from "@/components/organs/sheet";
import { MAX_RATING_PHOTOS } from "@/lib/utils/rating/rating-form";
import { colors, radius } from "@/styles/tokens";

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  onFailed: () => void;
}

export function RatingPhotos({ photos, onChange, onFailed }: Props) {
  const t = useTranslations("mobile");
  const [picking, setPicking] = useState(false);

  const pick = async (source: "camera" | "gallery") => {
    setPicking(false);
    try {
      const allowed = source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!allowed.granted) return onFailed();
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.7 };
      const result = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled) onChange([...photos, result.assets[0].uri]);
    } catch {
      // مفيش كاميرا (إيموليتر) أو الإذن اترفض
      onFailed();
    }
  };

  return (
    <View style={styles.root}>
      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
          {photos.map((uri, i) => (
            <View key={uri}>
              <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
              <Pressable
                onPress={() => onChange(photos.filter((_, j) => j !== i))}
                accessibilityLabel={t("a11y.remove", { label: t("rate.addPhoto") })}
                visualSize={{ width: 24, height: 24 }}
                style={styles.remove}
              >
                <Icon name="close" size={14} color={colors.onPrimary} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
      {photos.length < MAX_RATING_PHOTOS && (
        <Button label={photos.length ? t("rate.addAnotherPhoto") : t("rate.addPhoto")} icon="camera" variant="secondary" size="sm" onPress={() => setPicking(true)} />
      )}
      {picking && (
        <Sheet open onClose={() => setPicking(false)} title={t("rate.addPhoto")}>
          <ListGroup>
            <ListRow icon="camera" title={t("rate.fromCamera")} onPress={() => void pick("camera")} />
            <ListRow icon="plus" title={t("rate.fromGallery")} onPress={() => void pick("gallery")} />
          </ListGroup>
        </Sheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10 },
  thumbs: { gap: 8 },
  thumb: { width: 84, height: 84, borderRadius: radius.field, backgroundColor: colors.surf },
  remove: { position: "absolute", top: 4, end: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.scrim, alignItems: "center", justifyContent: "center" },
});
