// شاشة مؤقتة لحد ما الشاشة الحقيقية تتبني: العنوان + أرقام فريمات التصميم + params المسار + روابط للتنقل
import { Link, router, useLocalSearchParams, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/atoms/text";
import { colors, radius } from "@/styles/tokens";

export interface PlaceholderLink {
  label: string;
  href?: Href;
  onPress?: () => void;
}

interface Props {
  title: string;
  frames: string;
  links?: PlaceholderLink[];
  children?: React.ReactNode;
}

export function ScreenPlaceholder({ title, frames, links = [], children }: Props) {
  const params = useLocalSearchParams();
  const hasParams = Object.keys(params).length > 0;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {router.canGoBack() && (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.muted}>→ رجوع</Text>
          </Pressable>
        )}
        <Text weight="extrabold" style={styles.title}>{title}</Text>
        <Text style={styles.muted}>Design frames: {frames}</Text>
        {hasParams && <Text style={styles.muted}>{JSON.stringify(params)}</Text>}
        {children}
        {links.map((link) =>
          link.href ? (
            <Link key={link.label} href={link.href} asChild>
              <Pressable style={styles.link}>
                <Text weight="semibold" style={styles.linkText}>{link.label}</Text>
              </Pressable>
            </Link>
          ) : (
            <Pressable key={link.label} style={styles.link} onPress={link.onPress}>
              <Text weight="semibold" style={styles.linkText}>{link.label}</Text>
            </Pressable>
          ),
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 24 },
  muted: { color: colors.textSecondary },
  link: { padding: 14, borderRadius: radius.field, backgroundColor: colors.tealTint },
  linkText: { color: colors.teal },
});
