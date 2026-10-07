// الحالة الفاضية (.empty): رسمة + عنوان + شرح + أفعال حقيقية (مش رسالة وبس)
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Illustration, type IllustrationName } from "@/components/atoms/illustration";
import { Text } from "@/components/atoms/text";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";

interface Props {
  illustration?: IllustrationName;
  /** عرض الرسمة على 390 (بتصغر في الشاشات القصيرة) */
  illustrationWidth?: number;
  title: string;
  message?: string;
  children?: ReactNode;
}

export function EmptyState({ illustration, illustrationWidth = 190, title, message, children }: Props) {
  const { moderateScale, isShort } = useResponsive();
  const width = moderateScale(illustrationWidth) * (isShort ? 0.8 : 1);
  return (
    <View style={styles.root}>
      {illustration && <Illustration name={illustration} width={width} />}
      <Text variant="emptyTitle" accessibilityRole="header" style={[styles.title, !illustration && styles.titleTop]}>
        {title}
      </Text>
      {message && (
        <Text variant="bodyLong" style={styles.message}>
          {message}
        </Text>
      )}
      {children && <View style={styles.actions}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", paddingHorizontal: 34, paddingVertical: 36 },
  title: { marginTop: 20, marginBottom: 8, textAlign: "center" },
  titleTop: { marginTop: 0 },
  message: { textAlign: "center" },
  actions: { marginTop: 20, gap: 10, alignSelf: "stretch", alignItems: "center" },
});
