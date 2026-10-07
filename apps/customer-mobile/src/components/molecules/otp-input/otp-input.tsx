// خانات كود التأكيد (فريم 19–20): LTR دايماً حتى بالعربي. TextInput واحد شفاف فوق الخانات —
// فاللصق، والقراءة التلقائية من الرسالة (oneTimeCode / sms-otp)، والانتقال للخانة اللي بعدها بيشتغلوا لوحدهم.
import { useState, type Ref } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Text } from "@/components/atoms/text";
import { onlyDigits } from "@/lib/utils/format/digits.utils";
import { colors, radius, shadow } from "@/styles/tokens";

interface Props {
  value: string;
  onChange: (code: string) => void;
  /** عدد الخانات من challenge.codeLength (4 في التصميم) */
  length: number;
  error?: boolean;
  /** الكود اتقبل: أخضر ومكبّر شوية (زي Flutter isSuccess) */
  success?: boolean;
  /** يتنادى لما الكود يكمل */
  onComplete?: (code: string) => void;
  accessibilityLabel: string;
  autoFocus?: boolean;
  ref?: Ref<TextInput>;
}

export function OtpInput({ value, onChange, length, error, success, onComplete, accessibilityLabel, autoFocus = true, ref }: Props) {
  const [focused, setFocused] = useState(autoFocus);
  const active = Math.min(value.length, length - 1);

  return (
    <View style={styles.row}>
      {Array.from({ length }, (_, i) => {
        const isActive = focused && !error && !success && i === active && value.length < length;
        return (
          <View key={i} style={[styles.cell, value[i] ? styles.filled : null, isActive && styles.active, error && styles.error, success && styles.success]}>
            <Text dense variant="displayXs" size={26} color={success ? colors.okDark : error ? colors.errText : colors.textPrimary}>
              {value[i] ?? ""}
            </Text>
            {isActive && !value[i] && <View style={styles.caret} />}
          </View>
        );
      })}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(text) => {
          const code = onlyDigits(text).slice(0, length);
          onChange(code);
          if (code.length === length) onComplete?.(code);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        maxLength={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        importantForAutofill="yes"
        caretHidden
        accessibilityLabel={accessibilityLabel}
        style={styles.hiddenInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // LTR ثابت: الخانة الأولى على الشمال في اللغتين
  row: { flexDirection: "row", direction: "ltr", gap: 12, justifyContent: "center" },
  cell: {
    flex: 1,
    maxWidth: 72,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surf,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: { backgroundColor: colors.bg },
  active: { borderColor: colors.primary, backgroundColor: colors.bg, ...shadow.focusRing },
  error: { borderColor: colors.error, backgroundColor: colors.errTint },
  success: { borderColor: colors.success, backgroundColor: colors.okTint, transform: [{ scale: 1.06 }] },
  caret: { position: "absolute", width: 2, height: 26, borderRadius: 1, backgroundColor: colors.primary },
  // فوق الخانات كلها وشفاف: اللمس في أي خانة بيفتح الكيبورد
  hiddenInput: { ...StyleSheet.absoluteFill, opacity: 0.02, color: "transparent", fontSize: 1 },
});
