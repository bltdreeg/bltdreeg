// حوار التأكيد (فريم 30، و17 بعدين) فوق @rn-primitives/alert-dialog: أيقونة، عنوان، الأثر الحقيقي، ملاحظة، أكّد/خليني.
// محتاج PortalHost في src/app/_layout.tsx.
import * as AlertDialog from "@rn-primitives/alert-dialog";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, radius, shadow } from "@/styles/tokens";
import { duration } from "@/theme/motion";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: IconName;
  title: string;
  message: string;
  note?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, onOpenChange, icon, title, message, note, confirmLabel, cancelLabel, onConfirm }: Props) {
  const { formMaxWidth } = useResponsive();
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay style={styles.overlay}>
          <Animated.View entering={FadeIn.duration(duration.fast)} style={[styles.card, { maxWidth: Math.min(formMaxWidth, 420) }]}>
            <AlertDialog.Content>
              <View style={styles.icon}>
                <Icon name={icon} size={22} color={colors.err} />
              </View>
              <AlertDialog.Title asChild>
                <Text variant="dialogTitle">{title}</Text>
              </AlertDialog.Title>
              <AlertDialog.Description asChild>
                <Text variant="bodyLong" color={colors.textSecondary} style={styles.message}>
                  {message}
                </Text>
              </AlertDialog.Description>
              {note && (
                <View style={styles.note}>
                  <Icon name="alert_circle" size={15} color={colors.textSecondary} />
                  <Text variant="note" size={12.5} style={styles.flex}>
                    {note}
                  </Text>
                </View>
              )}
              <View style={styles.actions}>
                <AlertDialog.Action asChild>
                  <Button label={confirmLabel} variant="danger" size="md" onPress={onConfirm} />
                </AlertDialog.Action>
                <AlertDialog.Cancel asChild>
                  <Button label={cancelLabel} variant="secondary" size="md" onPress={() => onOpenChange(false)} />
                </AlertDialog.Cancel>
              </View>
            </AlertDialog.Content>
          </Animated.View>
        </AlertDialog.Overlay>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  card: { width: "100%", backgroundColor: colors.bg, borderRadius: radius.dialog, paddingTop: 24, paddingHorizontal: 22, paddingBottom: 18, ...shadow.pop },
  icon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.errTint, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  message: { marginTop: 8, marginBottom: 16 },
  note: { flexDirection: "row", gap: 9, backgroundColor: colors.surf, borderRadius: radius.field, padding: 12, marginBottom: 20 },
  flex: { flex: 1 },
  actions: { gap: 9 },
});
