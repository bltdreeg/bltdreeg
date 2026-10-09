// حقول الإدخال (.inp): عادي / focus / error / locked، مع label و"(اختياري)" ورسالة خطأ inline تحتها.
// PhoneField: البادئة "+20 🇪🇬" LTR جوه صف RTL، والأرقام نفسها LTR. SearchField: حقل البحث بأيقونة وزرار مسح.
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import { I18nManager, Platform, Pressable as RNPressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { useTranslations } from "use-intl";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { onlyDigits } from "@/lib/utils/format/digits.utils";
import { colors, font, radius, shadow, sizes, type } from "@/styles/tokens";

interface FrameProps {
  label?: string;
  optional?: boolean;
  focused?: boolean;
  error?: string | null;
  helper?: ReactNode;
  locked?: boolean;
  multiline?: boolean;
  height?: number;
  /** tap anywhere in the box (icon, +20 prefix, padding) → focus the input */
  onPressBox?: () => void;
  children: ReactNode;
}

/** الإطار المشترك: label + الصندوق بحالاته + الخطأ أو الـ helper تحته */
export function FieldFrame({ label, optional, focused, error, helper, locked, multiline, height = sizes.field, onPressBox, children }: FrameProps) {
  const t = useTranslations("mobile.a11y");
  const state = locked ? "locked" : error ? "error" : focused ? "focused" : "idle";
  return (
    <View style={styles.frame}>
      {label && (
        <Text variant="label">
          {label}
          {optional && <Text variant="label" weight="medium" color={colors.textSecondary}>{` ${t("optional")}`}</Text>}
        </Text>
      )}
      <RNPressable onPress={onPressBox} disabled={!onPressBox} accessible={false} style={[styles.box, BOX[state], multiline ? styles.multiline : { height }]}>
        {children}
      </RNPressable>
      {error ? <FieldError message={error} /> : helper}
    </View>
  );
}

export function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.error} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Icon name="alert_circle" size={sizes.iconSm} color={colors.error} />
      <Text variant="metaStrong" weight="semibold" color={colors.error} style={styles.flex}>
        {message}
      </Text>
    </View>
  );
}

interface FieldProps extends Omit<TextInputProps, "style" | "editable"> {
  label?: string;
  optional?: boolean;
  error?: string | null;
  helper?: ReactNode;
  icon?: IconName;
  prefix?: ReactNode;
  suffix?: ReactNode;
  password?: boolean;
  locked?: boolean;
  /** force LTR text (phone digits, emails) */
  ltr?: boolean;
  /** جوه Sheet: الشيت بيطلع فوق الكيبورد بس لما الحقل يكون BottomSheetTextInput */
  inSheet?: boolean;
  ref?: Ref<TextInput>;
}

export function TextField({ label, optional, error, helper, icon, prefix, suffix, password, locked, ltr, multiline, inSheet, onFocus, onBlur, ref, ...input }: FieldProps) {
  const t = useTranslations("mobile.a11y");
  const { fontSize } = useResponsive();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const inputRef = useRef<TextInput>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  const iconColor = locked ? colors.textDisabled : colors.textSecondary;
  // نفس props الـ TextInput؛ النوع بتاع gesture-handler بس اللي مختلف
  const Input = (inSheet ? BottomSheetTextInput : TextInput) as typeof TextInput;

  return (
    <FieldFrame label={label} optional={optional} focused={focused} error={error} helper={helper} locked={locked} multiline={multiline} onPressBox={locked ? undefined : () => inputRef.current?.focus()}>
      {icon && <Icon name={icon} size={sizes.iconSm} color={iconColor} />}
      {prefix}
      <Input
        ref={inputRef}
        {...input}
        accessibilityLabel={input.accessibilityLabel ?? label}
        editable={!locked}
        multiline={multiline}
        secureTextEntry={password && hidden}
        placeholderTextColor={colors.textDisabled}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        maxFontSizeMultiplier={1.4}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          { fontSize: fontSize(type.input.fontSize!) },
          locked && styles.inputLocked,
          multiline && styles.inputMultiline,
          ltr && styles.ltr,
        ]}
      />
      {password && (
        <Pressable
          onPress={() => setHidden((h) => !h)}
          accessibilityLabel={hidden ? t("showPassword") : t("hidePassword")}
          visualSize={{ width: 20, height: 20 }}
        >
          <Icon name={hidden ? "eye" : "eye_off"} size={sizes.iconSm + 2} color={iconColor} />
        </Pressable>
      )}
      {suffix}
    </FieldFrame>
  );
}

/** "+20 🇪🇬" — بيفضل LTR حتى في الواجهة العربي */
export function CountryPrefix({ muted }: { muted?: boolean }) {
  return (
    <View style={[styles.prefix, { borderEndColor: muted ? "#D6DADD" : colors.border }]}>
      <Text variant="label" size={14} weight="bold" color={muted ? colors.textDisabled : colors.textSecondary} style={styles.ltr}>
        {"+20 🇪🇬"}
      </Text>
    </View>
  );
}

export function PhoneField({ locked, onChangeText, ...props }: Omit<FieldProps, "prefix" | "ltr" | "keyboardType">) {
  return (
    <TextField
      {...props}
      onChangeText={(v) => onChangeText?.(onlyDigits(v))}
      locked={locked}
      ltr
      prefix={<CountryPrefix muted={locked} />}
      keyboardType="phone-pad"
      textContentType="telephoneNumber"
      autoComplete="tel"
      maxLength={11}
    />
  );
}

export function SearchField({ value, onChangeText, ...props }: Omit<FieldProps, "icon" | "suffix">) {
  const t = useTranslations("mobile.a11y");
  return (
    <TextField
      {...props}
      value={value}
      onChangeText={onChangeText}
      icon="search"
      returnKeyType="search"
      accessibilityRole="search"
      suffix={
        value ? (
          <Pressable onPress={() => onChangeText?.("")} accessibilityLabel={t("clearSearch")} visualSize={{ width: 20, height: 20 }}>
            <Icon name="close" size={sizes.iconSm + 2} color={colors.textSecondary} />
          </Pressable>
        ) : undefined
      }
    />
  );
}

const BOX = StyleSheet.create({
  idle: { backgroundColor: colors.surf, borderColor: colors.border },
  focused: { backgroundColor: colors.bg, borderColor: colors.primary, ...shadow.focusRing },
  error: { backgroundColor: colors.errTint, borderColor: colors.error },
  locked: { backgroundColor: colors.disabled, borderColor: colors.disabled },
});

const styles = StyleSheet.create({
  frame: { gap: 7 },
  box: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: radius.field, paddingHorizontal: 14 },
  multiline: { minHeight: 104, alignItems: "flex-start", paddingVertical: 4 },
  input: {
    flex: 1,
    alignSelf: "stretch",
    fontFamily: font.semibold,
    color: colors.textPrimary,
    textAlign: "auto",
    padding: 0,
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },
  inputLocked: { fontFamily: font.bold, color: colors.textDisabled },
  inputMultiline: { minHeight: 96, paddingVertical: 10, textAlignVertical: "top" },
  // قيمة لاتيني (بريد، أرقام موبايل) جوه واجهة RTL: الكتابة LTR بس بتبدأ من جنب أيقونة الحقل زي البورد
  ltr: { writingDirection: "ltr", textAlign: I18nManager.isRTL ? "right" : "left" },
  prefix: { paddingEnd: 10, borderEndWidth: 1 },
  error: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  flex: { flex: 1 },
});
