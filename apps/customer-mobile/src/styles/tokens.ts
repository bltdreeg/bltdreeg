// Design tokens — 1:1 with the Flutter app (apps/bltdreeg_cutsomer_mobile/lib/core/theme/*), which is the
// cleaned-up source of "Beltadreeg customer app design/mobile.html". Light only, Cairo, RTL.
import { Platform, type TextStyle, type ViewStyle } from "react-native";

// ---- app_colors.dart ----------------------------------------------------------
const raw = {
  teal: "#0F766E",
  tealDark: "#0B5A54",
  tealTint: "#E6F0EF",
  tealTint2: "#D3E5E3",
  bg: "#FFFFFF",
  surf: "#F7F8FA",
  /** لمعة الـ skeleton (Flutter Shimmer) */
  surfSheen: "#EDEFF2",
  tx: "#0E0F11",
  tx2: "#6B7280",
  line: "#E5E7EB",
  dis: "#E7EAEC",
  dist: "#A5ABB3",
  ok: "#16A34A",
  okDark: "#15803D",
  okTint: "#E7F4EA",
  warn: "#F59E0B",
  warnTint: "#FDF1DE",
  err: "#EF4444",
  errTint: "#FDEAEA",
  // recurring inline shades
  okText2: "#2E7D46",
  okBorder: "#CBE7D3",
  warnText: "#B45309",
  warnBorder: "#F5DDB4",
  onWarn: "#3D2A05",
  errText: "#B91C1C",
  errBorder: "#F3CFCF",
  placeholderIcon: "#C2C7CE",
  scrim: "rgba(14,15,17,0.45)",
  focusRing: "rgba(15,118,110,0.12)",
  tealDivider: "rgba(11,90,84,0.15)",
  navBackground: "rgba(255,255,255,0.97)",
} as const;

export const colors = {
  ...raw,
  // semantic aliases
  primary: raw.teal,
  primaryPressed: raw.tealDark,
  onPrimary: raw.bg,
  background: raw.bg,
  surface: raw.bg,
  surfaceMuted: raw.surf,
  textPrimary: raw.tx,
  textSecondary: raw.tx2,
  textDisabled: raw.dist,
  textOnPrimaryTint: raw.tealDark,
  divider: raw.line,
  border: raw.line,
  disabled: raw.dis,
  onDisabled: raw.dist,
  success: raw.ok,
  successDark: raw.okDark,
  successTint: raw.okTint,
  warning: raw.warn,
  warningTint: raw.warnTint,
  warningText: raw.warnText,
  error: raw.err,
  errorTint: raw.errTint,
  errorText: raw.errText,
  rating: raw.warn,
} as const;

// ---- app_tone.dart: semantic color families for notices, badges, dialogs, pills ----
export const tone = {
  neutral: { background: colors.surf, foreground: colors.textSecondary, border: colors.border, solid: colors.textSecondary },
  primary: { background: colors.tealTint, foreground: colors.tealDark, border: colors.tealTint2, solid: colors.primary },
  success: { background: colors.okTint, foreground: colors.okDark, border: colors.okBorder, solid: colors.ok },
  warning: { background: colors.warnTint, foreground: colors.warnText, border: colors.warnBorder, solid: colors.warn },
  danger: { background: colors.errTint, foreground: colors.errText, border: colors.errBorder, solid: colors.err },
} as const;
export type Tone = keyof typeof tone;

// ---- app_dimens.dart -----------------------------------------------------------
export const radius = { card: 14, field: 10, sheet: 22, pill: 999, xs: 6, sm: 8, md: 12, lg: 16, dialog: 18 } as const;

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, gutter: 20 } as const;

export const sizes = {
  buttonLg: 52,
  buttonMd: 48,
  buttonSm: 44,
  buttonXs: 38,
  field: 52,
  iconSm: 15,
  icon: 20,
  iconLg: 24,
  topBarButton: 38,
  bottomNavHeight: 68,
} as const;

export const shadow = {
  float: { boxShadow: "0 -6px 24px rgba(14,15,17,0.07)" },
  pop: { boxShadow: "0 18px 44px rgba(14,15,17,0.18)" },
  pin: { boxShadow: "0 2px 6px rgba(14,15,17,0.1)" },
  segment: { boxShadow: "0 1px 3px rgba(14,15,17,0.1)" },
  focusRing: { boxShadow: `0 0 0 3px ${raw.focusRing}` },
} satisfies Record<string, ViewStyle>;

// ---- app_typography.dart ---------------------------------------------------------
// Cairo متضمّن في البيلد (expo-font plugin في app.json): Android بيسمّيه باسم الملف، iOS باسم الـ PostScript
const cairo = (file: string, postScript: string) => (Platform.OS === "ios" ? postScript : file);
export const font = {
  regular: cairo("Cairo_400Regular", "Cairo-Regular"),
  medium: cairo("Cairo_500Medium", "Cairo-Medium"),
  semibold: cairo("Cairo_600SemiBold", "Cairo-SemiBold"),
  bold: cairo("Cairo_700Bold", "Cairo-Bold"),
  extrabold: cairo("Cairo_800ExtraBold", "Cairo-ExtraBold"),
} as const;
export type FontWeight = keyof typeof font;

const w = { 400: font.regular, 500: font.medium, 600: font.semibold, 700: font.bold, 800: font.extrabold } as const;

/** Flutter `height` is a multiplier; RN lineHeight is absolute, so lineHeight = size * height. */
const t = (fontSize: number, weight: keyof typeof w, height: number, extra: TextStyle = {}): TextStyle => ({
  fontSize,
  fontFamily: w[weight],
  lineHeight: Math.round(fontSize * height),
  ...extra,
});

export const type = {
  queueNumber: t(72, 800, 1.08),
  displayLg: t(58, 800, 1.1),
  displayMd: t(52, 800, 1),
  displaySm: t(38, 800, 1.2),
  displayXs: t(34, 800, 1.25, { letterSpacing: -0.5 }),
  headline: t(23, 800, 1.45, { letterSpacing: -0.3 }),
  pageTitle: t(22, 800, 1.4),
  titleXl: t(21, 800, 1.4),
  emptyTitle: t(19, 800, 1.45),
  statValue: t(21, 800, 1.3),
  titleLg: t(18, 700, 1.4, { letterSpacing: -0.2 }),
  dialogTitle: t(18, 800, 1.4),
  titleMd: t(17, 800, 1.4),
  topBarTitle: t(16, 800, 1.4),
  sectionTitle: t(16, 700, 1.4),
  itemTitle: t(15.5, 700, 1.4),
  bodyStrong: t(14.5, 700, 1.5),
  body: t(14.5, 600, 1.5),
  bodyLong: t(14, 400, 1.8, { color: colors.textSecondary }),
  bodySm: t(13.5, 500, 1.8),
  note: t(13, 500, 1.7, { color: colors.textSecondary }),
  button: t(16, 700, 1.3),
  buttonSm: t(14.5, 700, 1.3),
  label: t(13.5, 600, 1.4),
  input: t(15, 600, 1.4),
  link: t(13.5, 700, 1.4, { color: colors.primary }),
  meta: t(12.5, 500, 1.5, { color: colors.textSecondary }),
  metaStrong: t(12.5, 700, 1.4),
  groupLabel: t(12.5, 700, 1.4, { color: colors.textSecondary }),
  caption: t(12, 400, 1.5, { color: colors.textSecondary }),
  badge: t(12, 700, 1.3),
  tag: t(11.5, 700, 1.3),
  navLabel: t(11, 600, 1.3),
  micro: t(10.5, 700, 1.3),
} satisfies Record<string, TextStyle>;
export type TypeVariant = keyof typeof type;
