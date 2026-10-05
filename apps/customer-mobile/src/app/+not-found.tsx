import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { colors } from "@/styles/tokens";

export default function NotFound() {
  const t = useTranslations("common.notFoundPage");
  return (
    <View style={styles.root}>
      <Text weight="bold" style={styles.title}>{t("title")}</Text>
      <Link href="/home">
        <Text style={styles.link}>{t("home")}</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.bg },
  title: { fontSize: 20 },
  link: { color: colors.teal },
});
