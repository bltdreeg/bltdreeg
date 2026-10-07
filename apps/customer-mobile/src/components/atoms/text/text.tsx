// نص التطبيق: خط Cairo + سلّم الخطوط من tokens — RN مالهوش خط افتراضي عام، فكل نص لازم يعدي من هنا.
// المقاس بيتظبط مع عرض الشاشة (0.9×–1.15×)، وتكبير خط النظام محدود عشان الصفوف ما تتكسرش.
import { Platform, Text as RNText, StyleSheet, type TextProps } from "react-native";
import { getLocale } from "@/i18n/config";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, font, type, type FontWeight, type TypeVariant } from "@/styles/tokens";

interface Props extends TextProps {
  /** a style from the type scale (default `body`) */
  variant?: TypeVariant;
  /** one-off weight override on top of the variant */
  weight?: FontWeight;
  color?: string;
  /** one-off design font size (still scaled + clamped); line height keeps the variant's ratio */
  size?: number;
  /** dense UI (chips, nav labels, badges, OTP cells): caps system font scaling at 1.2 instead of 1.4 */
  dense?: boolean;
  /** أرقام بس (رقم الدور الكبير): مفيهاش نقط ولا ذيول، فبتاخد line height التصميم بدل حد Cairo */
  digits?: boolean;
}

export function Text({ variant = "body", weight, color, size: designSize, dense, digits, style, ...props }: Props) {
  const { fontSize } = useResponsive();
  const base = type[variant];
  const size = fontSize(designSize ?? base.fontSize!);
  const designLine = base.lineHeight && Math.round((base.lineHeight * size) / base.fontSize!);
  const arabic = getLocale() === "ar";
  // Cairo بيرسم في صندوق ارتفاعه 1.874× المقاس؛ أقل من كده Android بيقص أطراف الحروف ونقط الياء
  const lineHeight = arabic && !digits ? Math.max(designLine ?? 0, arabicLineHeight(size)) : designLine;

  return (
    <RNText
      maxFontSizeMultiplier={dense ? 1.2 : 1.4}
      // Android بيقيس عرض العربي بخط Cairo أضيق شوية مع الـ break strategy العالية فآخر حرف بيتقص ("أو سجّل بـ" → "أو سجّل")
      textBreakStrategy="simple"
      {...props}
      style={[
        styles.base,
        base,
        { fontSize: size, lineHeight },
        // letterSpacing السالب في التصميم للاتيني بس — بيقطّع الحروف العربي المتصلة
        arabic && styles.noTracking,
        weight && { fontFamily: font[weight] },
        color !== undefined && { color },
        style,
      ]}
    />
  );
}

/** أقل line height ما يقصّش Cairo (hhea 1303/−571 من 1000) */
export const arabicLineHeight = (size: number) => Math.round(size * 1.875);

const styles = StyleSheet.create({
  noTracking: { letterSpacing: 0 },
  // Android بيزود padding فوق وتحت الخط — بيبوّظ التوسيط الرأسي لـ Cairo
  base: { color: colors.textPrimary, textAlign: "auto", ...(Platform.OS === "android" && { includeFontPadding: false }) },
});
