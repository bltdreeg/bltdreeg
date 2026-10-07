// معرض الـ design system (dev بس) — زي lib/core/dev/design_system_gallery_page.dart في Flutter.
// الهدف: نشوف على جهاز حقيقي إن الألوان والخطوط والأيقونات اتنقلت صح (تلوين currentColor، قلب RTL، أوزان Cairo).
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, icons, type IconName } from "@/components/atoms/icon";
import { Illustration, illustrations, type IllustrationName } from "@/components/atoms/illustration";
import { Text } from "@/components/atoms/text";
import { TopBar } from "@/components/molecules/top-bar";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, radius, shadow, spacing, tone, type, type Tone, type TypeVariant } from "@/styles/tokens";
import { ComponentsGallery } from "./__sections/components-gallery";

const SAMPLE = "احجز ميعاد — رقمك في الدور 3";

export default function DesignSystemScreen() {
  const { gutter, listMaxWidth } = useResponsive();
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={[styles.topBar, { paddingHorizontal: gutter }]}>
        <TopBar title="Design system" />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { padding: gutter, maxWidth: listMaxWidth }]}>
        <ComponentsGallery />

        <Section title="Colors">
          <View style={styles.wrap}>
            {Object.entries(colors).map(([name, value]) => (
              <View key={name} style={styles.swatchItem}>
                <View style={[styles.swatch, { backgroundColor: value }]} />
                <Text variant="metaStrong" numberOfLines={1}>{name}</Text>
                <Text variant="caption" numberOfLines={1}>{value}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Tones">
          {(Object.keys(tone) as Tone[]).map((name) => (
            <View
              key={name}
              style={[styles.tone, { backgroundColor: tone[name].background, borderColor: tone[name].border }]}
            >
              <View style={[styles.dot, { backgroundColor: tone[name].solid }]} />
              <Text variant="bodyStrong" style={{ color: tone[name].foreground }}>{name}</Text>
            </View>
          ))}
        </Section>

        <Section title="Type scale">
          {(Object.keys(type) as TypeVariant[]).map((variant) => (
            <View key={variant} style={styles.typeRow}>
              <Text variant="caption">
                {variant} · {type[variant].fontSize}/{type[variant].fontFamily?.replace("Cairo_", "")}
              </Text>
              <Text variant={variant} numberOfLines={2}>{SAMPLE}</Text>
            </View>
          ))}
        </Section>

        <Section title="Radii & shadows">
          <View style={styles.wrap}>
            {Object.entries(radius).map(([name, value]) => (
              <View key={name} style={[styles.box, { borderRadius: Math.min(value, 36) }]}>
                <Text variant="metaStrong">{name}</Text>
                <Text variant="caption">{value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.wrap}>
            {Object.entries(shadow).map(([name, value]) => (
              <View key={name} style={[styles.box, styles.shadowBox, value]}>
                <Text variant="metaStrong">{name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title={`Icons (${Object.keys(icons).length})`}>
          <View style={styles.wrap}>
            {(Object.keys(icons) as IconName[]).map((name) => (
              <View key={name} style={styles.iconItem}>
                <Icon name={name} size={24} />
                <Text variant="micro" numberOfLines={1} style={styles.center}>{name}</Text>
              </View>
            ))}
          </View>
          <Text variant="groupLabel">Tinted</Text>
          <View style={styles.row}>
            <Icon name="star_filled" size={28} color={colors.rating} />
            <Icon name="heart_filled" size={28} color={colors.err} />
            <Icon name="check_bold" size={28} color={colors.ok} />
            <Icon name="home_bold" size={28} color={colors.primary} />
            <Icon name="google" size={28} />
          </View>
          <Text variant="groupLabel">RTL-mirrored (mirror) vs. raw</Text>
          <View style={styles.row}>
            <Icon name="chevron_left" size={28} mirror />
            <Icon name="chevron_right" size={28} mirror />
            <Text variant="caption">|</Text>
            <Icon name="chevron_left" size={28} />
            <Icon name="chevron_right" size={28} />
          </View>
        </Section>

        <Section title={`Illustrations (${Object.keys(illustrations).length})`}>
          {(Object.keys(illustrations) as IllustrationName[]).map((name) => (
            <View key={name} style={styles.illustration}>
              <Illustration name={name} width={200} />
              <Text variant="caption">{name}</Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="sectionTitle">{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  content: { gap: spacing.xxxl, width: "100%", alignSelf: "center" },
  section: { gap: spacing.md },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  center: { textAlign: "center" },
  swatchItem: { width: 96, gap: spacing.xxs },
  swatch: { height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  tone: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  typeRow: { gap: spacing.xxs, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  box: {
    width: 96,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.tealTint,
    borderWidth: 1,
    borderColor: colors.tealTint2,
  },
  shadowBox: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card },
  iconItem: { width: 72, alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm },
  illustration: { alignItems: "center", gap: spacing.xs },
});
