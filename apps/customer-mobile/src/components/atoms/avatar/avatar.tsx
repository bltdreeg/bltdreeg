// أفاتار بالحروف الأولى (fallback لما مفيش صورة — فريم 16). المقاسات من التصميم: 84 / 64 / 52 / 42 / 36
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/atoms/text";
import { initials } from "@/lib/utils/initials";
import { colors } from "@/styles/tokens";

export type AvatarSize = 84 | 64 | 52 | 42 | 36;


interface Props {
  name: string;
  size?: AvatarSize;
  tone?: "teal" | "surface";
  dimmed?: boolean;
  /** حلقة 1px (البورد: هيدر حسابي وبياناتي الشخصية) */
  ring?: boolean;
}

export function Avatar({ name, size = 42, tone = "teal", dimmed, ring }: Props) {
  const fontSize = Math.round(size * 0.33);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.root,
        { width: size, height: size, borderRadius: size / 2 },
        tone === "teal" ? styles.teal : styles.surface,
        ring && styles.ring,
        dimmed && styles.dimmed,
      ]}
    >
      <Text
        dense
        color={tone === "teal" ? colors.tealDark : colors.textSecondary}
        weight="extrabold"
        size={fontSize}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", justifyContent: "center" },
  teal: { backgroundColor: colors.tealTint },
  surface: { backgroundColor: colors.surf, borderWidth: 1, borderColor: colors.line },
  ring: { borderWidth: 1, borderColor: colors.tealTint2 },
  dimmed: { opacity: 0.5 },
});
