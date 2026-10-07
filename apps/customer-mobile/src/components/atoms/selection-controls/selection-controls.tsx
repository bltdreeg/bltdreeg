// Toggle / Radio / Checkbox من التصميم، فوق @rn-primitives (الدور والحالة والضغط منهم، الشكل مننا).
// الـ Toggle في RTL "شغّال" = الدايرة ناحية الشمال (flex-end).
import * as CheckboxPrimitive from "@rn-primitives/checkbox";
import * as RadioGroupPrimitive from "@rn-primitives/radio-group";
import * as SwitchPrimitive from "@rn-primitives/switch";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { colors } from "@/styles/tokens";

const CONTROL_BORDER = "#C9CED4";
const noop = () => {};

interface ToggleProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  /** مقفولة على "شغّالة" (إشعارات الطابور — فريم 37) */
  locked?: boolean;
  accessibilityLabel: string;
}

export function Toggle({ value, onValueChange, locked, accessibilityLabel }: ToggleProps) {
  return (
    <SwitchPrimitive.Root
      asChild
      checked={value}
      onCheckedChange={onValueChange ?? noop}
      disabled={locked || !onValueChange}
      // الـ primitive بيقول "on"/"off" بالإنجليزي؛ فاضي = TalkBack/VoiceOver يقولوا الحالة بلغة الجهاز
      aria-valuetext=""
      accessibilityLabel={accessibilityLabel}
    >
      <Pressable visualSize={{ width: 44, height: 26 }} style={[styles.track, value ? styles.trackOn : styles.trackOff, locked && styles.locked]}>
        <SwitchPrimitive.Thumb style={styles.knob} />
      </Pressable>
    </SwitchPrimitive.Root>
  );
}

/** بيلم مجموعة Radio: القيمة المختارة واحدة */
export const RadioGroup = RadioGroupPrimitive.Root;

interface RadioProps {
  value: string;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export function Radio({ value, accessibilityLabel, disabled }: RadioProps) {
  return (
    <RadioGroupPrimitive.Item asChild value={value} disabled={disabled} accessibilityLabel={accessibilityLabel}>
      <Pressable visualSize={{ width: 20, height: 20 }} style={styles.radio}>
        <RadioGroupPrimitive.Indicator style={styles.radioOn} />
      </Pressable>
    </RadioGroupPrimitive.Item>
  );
}

/** الكارت كله هو الـ radio (اختيار الحلاق — فريم 24)؛ الدايرة جوه مرسومة بس */
export function RadioCard({ value, disabled, accessibilityLabel, style, children }: RadioProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <RadioGroupPrimitive.Item asChild value={value} disabled={disabled} accessibilityLabel={accessibilityLabel}>
      <Pressable style={style} pressedScale={0.99}>
        {children}
      </Pressable>
    </RadioGroupPrimitive.Item>
  );
}

/** دايرة الـ radio جوه RadioCard */
export function RadioDot({ disabled }: { disabled?: boolean }) {
  return (
    <View style={[styles.radio, disabled && styles.radioDisabled]}>
      <RadioGroupPrimitive.Indicator style={styles.radioOn} />
    </View>
  );
}

interface CheckboxProps {
  checked: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
}

// Checkbox.Root مابيمررش asChild للـ Trigger، فبنشكّل الـ Pressable بتاعه مباشرة (hitSlop يكمّل لـ 44)
export function Checkbox({ checked, onPress, accessibilityLabel, disabled }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={onPress ?? noop}
      disabled={disabled || !onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={11}
      style={[styles.box, checked ? styles.boxOn : styles.boxOff]}
    >
      <CheckboxPrimitive.Indicator>
        <Icon name="check_bold" size={14} color={colors.onPrimary} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

const styles = StyleSheet.create({
  track: { width: 44, height: 26, borderRadius: 13, padding: 3, flexDirection: "row" },
  trackOn: { backgroundColor: colors.teal, justifyContent: "flex-end" },
  trackOff: { backgroundColor: colors.dis, justifyContent: "flex-start" },
  locked: { opacity: 0.55 },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.bg, boxShadow: "0 1px 2px rgba(14,15,17,0.2)" },
  radio: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: CONTROL_BORDER },
  radioDisabled: { backgroundColor: colors.dis, borderColor: colors.dis },
  // بيغطي الإطار الرمادي: الـ absolute بيتحسب من جوه الـ border فبنطلع بعرضه
  radioOn: { position: "absolute", top: -1.5, bottom: -1.5, start: -1.5, end: -1.5, borderRadius: 10, borderWidth: 6, borderColor: colors.teal, backgroundColor: colors.bg },
  box: { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  boxOn: { backgroundColor: colors.teal },
  boxOff: { backgroundColor: colors.bg, borderWidth: 1.5, borderColor: CONTROL_BORDER },
});
