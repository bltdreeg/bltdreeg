// الشيت السفلي (.sheet — فريم 40، والفلاتر بعدين): مقبض + عنوان وزرار قفل + محتوى بيسكرول + فوتر ثابت بحد علوي. أقصاه ٨٨٪.
// BottomSheet جوه Modal شفاف (فوق التاب بار) بدل BottomSheetModal: الـ portal بتاعه مابيفتحش مع Reanimated 4.5 / RN 0.86.
import BottomSheet, { BottomSheetBackdrop, BottomSheetFooter, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRef, useState, type ReactNode } from "react";
import { Modal, StyleSheet, View, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { IconButton } from "@/components/molecules/icon-button";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, radius, shadow } from "@/styles/tokens";

interface Props {
  open: boolean;
  /** بيتنادى بعد ما الشيت يخلص نزول (سحب، ضغطة برّه، رجوع، أو زرار القفل) */
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, footer, children }: Props) {
  const t = useTranslations("mobile.a11y");
  const ref = useRef<BottomSheet>(null);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { gutter, listMaxWidth } = useResponsive();
  const [footerHeight, setFooterHeight] = useState(0);
  const close = () => ref.current?.close();

  return (
    <Modal visible={open} transparent statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={close}>
      {/* Android: الإيماءات جوه Modal محتاجة root خاص بيها */}
      <GestureHandlerRootView style={styles.flex}>
        <BottomSheet
          ref={ref}
          onClose={onClose}
          enablePanDownToClose
          maxDynamicContentSize={height * 0.88}
          topInset={insets.top}
          // على التابلت الشيت في النص بعرض القايمة (الحاوية absolute فـ alignSelf مابيشتغلش)
          style={[styles.sheet, { marginHorizontal: Math.max(0, (width - listMaxWidth) / 2) }]}
          backgroundStyle={styles.background}
          keyboardBehavior="interactive"
          android_keyboardInputMode="adjustResize"
          backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={1} style={[props.style, styles.scrim]} />}
          handleComponent={() => (
            <View>
              <View style={styles.grab} />
              <View style={[styles.header, { paddingHorizontal: gutter }]}>
                <Text variant="titleMd" accessibilityRole="header" style={styles.flex}>
                  {title}
                </Text>
                <IconButton icon="close" variant="filled" iconSize={16} onPress={close} accessibilityLabel={t("close")} />
              </View>
            </View>
          )}
          footerComponent={
            footer
              ? (props) => (
                  <BottomSheetFooter {...props}>
                    <View onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)} style={[styles.footer, { paddingHorizontal: gutter, paddingBottom: insets.bottom + 14 }]}>
                      {footer}
                    </View>
                  </BottomSheetFooter>
                )
              : undefined
          }
        >
          <BottomSheetScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: 16, paddingBottom: footer ? footerHeight + 8 : insets.bottom + 16 }}>
            {children}
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: { ...shadow.pop, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet },
  background: { backgroundColor: colors.bg, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet },
  scrim: { backgroundColor: colors.scrim },
  grab: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: "center", marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  footer: { paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
});
