// نص التطبيق: خط Cairo + سلّم الخطوط من tokens — RN مالهوش خط افتراضي عام، فكل نص لازم يعدي من هنا
import { Text as RNText, StyleSheet, type TextProps } from "react-native";
import { colors, font, type, type FontWeight, type TypeVariant } from "@/styles/tokens";

interface Props extends TextProps {
  /** a style from the type scale (default `body`) */
  variant?: TypeVariant;
  /** one-off weight override on top of the variant */
  weight?: FontWeight;
}

export function Text({ variant = "body", weight, style, ...props }: Props) {
  return (
    <RNText {...props} style={[styles.base, type[variant], weight && { fontFamily: font[weight] }, style]} />
  );
}

const styles = StyleSheet.create({
  base: { color: colors.textPrimary },
});
