// المقاسات المتجاوبة: التصميم معمول على 390×844. التخطيط flex؛ الـ scale هنا للخطوط والرسومات والأرقام الكبيرة بس.

export const BASE_WIDTH = 390;

export type Breakpoint = "compact" | "regular" | "large" | "tablet";

export function breakpointOf(width: number): Breakpoint {
  if (width >= 600) return "tablet";
  if (width >= 430) return "large";
  if (width >= 360) return "regular";
  return "compact";
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function metrics(width: number, height: number) {
  const breakpoint = breakpointOf(width);
  const isTablet = breakpoint === "tablet";
  const ratio = width / BASE_WIDTH;

  /** خطي مع العرض — للرسومات والـ hero بس */
  const scale = (n: number) => n * ratio;
  /** نص المسافة بين الأصل والـ scale — للأيقونات والمسافات */
  const moderateScale = (n: number, factor = 0.4) => n + (scale(n) - n) * factor;
  /** مقاس خط: moderateScale محصور بين 0.9× و 1.15× من مقاس التصميم */
  const fontSize = (n: number) => Math.round(clamp(moderateScale(n), n * 0.9, n * 1.15) * 2) / 2;

  return {
    width,
    height,
    breakpoint,
    isCompact: breakpoint === "compact",
    isTablet,
    /** SE 2/3 والأندرويد الصغير: الشاشات الطويلة تبقى scroll والرسومات تصغر */
    isShort: height < 700,
    gutter: breakpoint === "compact" ? 16 : 20,
    /** أقصى عرض للمحتوى: الفورم والخطوات 560، القوايم 720، والموبايل كامل العرض */
    formMaxWidth: isTablet ? 560 : width,
    listMaxWidth: isTablet ? 720 : width,
    scale,
    moderateScale,
    fontSize,
  };
}

export type Metrics = ReturnType<typeof metrics>;
