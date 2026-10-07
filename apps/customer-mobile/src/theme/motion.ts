// كل توقيتات ومنحنيات الحركة في التطبيق — منقولة من AppMotion في Flutter (lib/core/theme/app_dimens.dart).
// ممنوع أي توقيت inline في الشاشات. لو "تقليل الحركة" شغّال في النظام: fade بدل الحركة (useReducedMotion).
import { Easing } from "react-native-reanimated";

/** milliseconds */
export const duration = {
  press: 90,
  release: 160,
  fast: 180,
  medium: 280,
  slow: 480,
  celebrate: 900,
  /** لمعة الـ skeleton بتعدّي (Flutter Shimmer) */
  shimmer: 1300,
  /** الكود الصح بيفضل أخضر قبل ما نمشي (Flutter OtpPage._successHold) */
  successHold: 650,
  /** نبض نقطة "لايف" */
  livePulse: 1400,
} as const;

/** منحنيات Flutter بنفس قيم الـ cubic-bezier بتاعتها */
export const easing = {
  /** Curves.easeOutCubic — AppMotion.standard */
  standard: Easing.bezier(0.215, 0.61, 0.355, 1),
  /** Curves.easeOutBack — AppMotion.emphasized (فيه overshoot خفيف) */
  emphasized: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  /** Curves.easeInOutCubic — قلب صفحات الأونبوردنج */
  page: Easing.bezier(0.645, 0.045, 0.355, 1),
} as const;

/** منحنيات بتتنادى جوه worklet (مش factories زي easing فوق) — للرسومات المتحركة */
export const curve = {
  /** Curves.easeOutCubic */
  outCubic: Easing.out(Easing.cubic),
  /** Curves.bounceOut */
  bounceOut: Easing.bounce,
  /** Curves.elasticOut (تقريبي) */
  elasticOut: Easing.elastic(1),
  /** Curves.easeOutBack */
  backOut: Easing.bezierFn(0.175, 0.885, 0.32, 1.275),
  /** Curves.easeOutQuad */
  outQuad: Easing.out(Easing.quad),
} as const;

/** رسومات الأونبوردنج المتحركة (Flutter onboarding_illustrations.dart): دخول مرة واحدة + loop وهي ظاهرة */
export const onboardingArt = {
  findSalons: { entrance: 1300, loop: 2600 },
  liveQueue: { entrance: 700, loop: 6000, tick: 1100, swap: 360 },
  chooseBarber: { entrance: 1500, loop: 2400 },
} as const;

/** "دخلت الطابور" (فريم 26): هالة، دايرة، ✓ بترسم نفسها، موجة ونقط — Flutter QueueJoinedIllustration */
export const queueJoinedArt = { duration: 1500, checkDoneAt: 0.62 } as const;

export const pressedScale = 0.97;
