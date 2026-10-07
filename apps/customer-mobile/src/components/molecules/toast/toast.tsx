// تنبيه سريع تحت (زي showToast في Flutter = SnackBar): رسالة واحدة بتختفي بعد ٣ ثواني، الجديدة بتشيل القديمة.
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { onToast } from "@/lib/utils/toast-bus";
import { colors, radius, shadow } from "@/styles/tokens";
import { duration } from "@/theme/motion";

const VISIBLE_MS = 3000;

/** بيرجّع العنصر (حطه آخر حاجة في الشاشة) و show(نص) */
export function useToast() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const node = toast && (
    <Animated.View
      key={toast.id}
      entering={FadeInDown.duration(duration.medium)}
      exiting={FadeOut.duration(duration.fast)}
      style={[styles.root, { bottom: insets.bottom + 16 }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      pointerEvents="none"
    >
      <Text variant="body" color={colors.bg}>
        {toast.text}
      </Text>
    </Animated.View>
  );

  return { toast: node, show: (text: string) => setToast({ id: Date.now(), text }) };
}

/** مرة واحدة في app/_layout.tsx — بيعرض showToast() من lib/utils/toast-bus */
export function ToastHost() {
  const t = useTranslations("mobile");
  const { toast, show } = useToast();
  useEffect(() => onToast((key, values) => show(t(key, values))), [show, t]);
  return toast;
}

const styles = StyleSheet.create({
  root: { position: "absolute", start: 16, end: 16, backgroundColor: colors.tx, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, ...shadow.pop },
});
