// أيقونة من icons.ts — لون واحد عن طريق currentColor. mirror للأيقونات الاتجاهية (أسهم، رجوع) عشان تتقلب في RTL
import { I18nManager } from "react-native";
import { colors, sizes } from "@/styles/tokens";
import { icons, type IconName } from "./icons";

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  /** flip horizontally in RTL (Flutter's matchTextDirection) */
  mirror?: boolean;
  accessibilityLabel?: string;
}

const flipped = { transform: [{ scaleX: -1 }] };

export function Icon({ name, size = sizes.icon, color = colors.textPrimary, mirror, accessibilityLabel }: Props) {
  const Svg = icons[name];
  return (
    <Svg
      width={size}
      height={size}
      color={color}
      style={mirror && I18nManager.isRTL ? flipped : undefined}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
