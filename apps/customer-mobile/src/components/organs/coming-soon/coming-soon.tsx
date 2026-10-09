// شاشة لسه بتتبني: هيدر التصميم + رسالة قصيرة — من غير قايمة روابط ولا معلومات تطوير (الهدف: صفر منها في آخر Phase 5)
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { EmptyState } from "@/components/molecules/empty-state";
import { TopBar } from "@/components/molecules/top-bar";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors } from "@/styles/tokens";

interface Props {
  title: string;
  /** شاشات التابات الرئيسية: عنوان صفحة من غير زرار رجوع */
  tabRoot?: boolean;
  children?: ReactNode;
}

export function ComingSoon({ title, tabRoot, children }: Props) {
  const t = useTranslations("mobile.comingSoon");
  const { gutter, listMaxWidth } = useResponsive();
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}>
        {tabRoot ? (
          <Text variant="pageTitle" accessibilityRole="header" style={styles.pageTitle}>
            {title}
          </Text>
        ) : (
          <TopBar title={title} />
        )}
        <View style={styles.body}>
          <EmptyState title={t("title")}>
            {children}
          </EmptyState>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, width: "100%", alignSelf: "center" },
  pageTitle: { paddingTop: 14, paddingBottom: 4 },
  body: { flex: 1, justifyContent: "center" },
});
