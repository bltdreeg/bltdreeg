// شاشة فورم (الدخول، التسجيل، الـ OTP، تعديل البيانات): safe area + scroll بيتحرك مع الكيبورد
// عشان الحقل اللي عليه الفوكس والزرار اللي تحته يفضلوا ظاهرين حتى على 360×640. على التابلت العمود في النص (560).
import type { ReactNode } from "react";
import { router } from "expo-router";
import { Keyboard, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors } from "@/styles/tokens";

/** المسافة اللي بنسيبها تحت الحقل وقت الكيبورد: زرار أساسي (52) + مسافة */
const KEYBOARD_OFFSET = 96;

/** keyboardOffset: لو الزرار أبعد من 96 تحت الحقل (الـ OTP: سطر العداد + الزرار) */
export function FormScreen({ header, keyboardOffset = KEYBOARD_OFFSET, children }: { header?: ReactNode; keyboardOffset?: number; children: ReactNode }) {
  const { gutter, formMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const column = { paddingHorizontal: gutter, maxWidth: formMaxWidth };
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {header && <View style={[styles.column, column]}>{header}</View>}
      <KeyboardAwareScrollView
        bottomOffset={keyboardOffset}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.column, column, { paddingBottom: Math.max(24, insets.bottom + 8) }]}
      >
        {children}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

/**
 * فتح شاشة الكود من فورم: الكيبورد بيتقفل الأول عشان يتفتح من جديد على شاشة الكود —
 * لو فضل مفتوح، KeyboardAwareScrollView هناك مش بيوصله حدث ظهور الكيبورد فمش بيسكرول والخلايا تتغطى (360×640).
 */
export function toOtp(params: { phone: string; purpose: "login" | "register" | "reset_password"; from?: string }) {
  Keyboard.dismiss();
  router.push({ pathname: "/otp", params });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  column: { width: "100%", alignSelf: "center" },
});
