// رسمة ثابتة من illustrations.ts — الارتفاع من نسبة الـ viewBox. الأرقام والنصوص بتتحط فوقها في الكود (مش جوه الـ SVG)
import { illustrations, type IllustrationName } from "./illustrations";

export function Illustration({ name, width }: { name: IllustrationName; width: number }) {
  const { Svg, ratio } = illustrations[name];
  return <Svg width={width} height={width / ratio} accessible={false} />;
}
