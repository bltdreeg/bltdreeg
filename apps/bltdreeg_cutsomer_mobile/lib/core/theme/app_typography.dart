import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Named text styles mapped from the design board. Widgets use these (or
/// `copyWith` on them) and never construct `TextStyle` inline.
///
/// Cairo has tall Arabic ascenders and diacritics, so multi-line styles use
/// generous line heights with even leading distribution to avoid clipping
/// and crowding between lines. Single-line numerals use tighter heights.
///
/// Colors are left null on most styles so they inherit from the ambient
/// `DefaultTextStyle` (textPrimary), matching CSS inheritance on the board.
abstract final class AppTypography {
  static const fontFamily = 'Cairo';

  static const _base = TextStyle(
    fontFamily: fontFamily,
    // Explicit 0: otherwise Material's default letter spacing (0.25–0.5)
    // leaks in, which pulls joined Arabic letters apart and makes text
    // wider than designed.
    letterSpacing: 0,
    leadingDistribution: TextLeadingDistribution.even,
  );

  // ---- display numerals (queue numbers, countdowns) ------------------------
  /// Queue number on the live tracking card (72px).
  static final queueNumber = _base.copyWith(
    fontSize: 72,
    fontWeight: FontWeight.w800,
    height: 1.08,
  );

  /// Queue number on the confirmation card (58px).
  static final displayLg = _base.copyWith(
    fontSize: 58,
    fontWeight: FontWeight.w800,
    height: 1.1,
  );

  /// Active queue number on the bookings card (52px).
  static final displayMd = _base.copyWith(
    fontSize: 52,
    fontWeight: FontWeight.w800,
    height: 1,
  );

  /// "Your turn" stats (38px).
  static final displaySm = _base.copyWith(
    fontSize: 38,
    fontWeight: FontWeight.w800,
    height: 1.2,
  );

  /// "Your turn" title and big rating value (34px).
  static final displayXs = _base.copyWith(
    fontSize: 34,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.5,
    height: 1.25,
  );

  // ---- headings ---------------------------------------------------------------
  /// `h2.t` — onboarding and auth titles.
  static final headline = _base.copyWith(
    fontSize: 23,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.3,
    height: 1.45,
  );

  /// Root tab titles ("حجوزاتي", "حسابي").
  static final pageTitle = _base.copyWith(
    fontSize: 22,
    fontWeight: FontWeight.w800,
    height: 1.4,
  );

  /// Salon name on the salon page.
  static final titleXl = _base.copyWith(
    fontSize: 21,
    fontWeight: FontWeight.w800,
    height: 1.4,
  );

  /// Empty-state titles.
  static final emptyTitle = _base.copyWith(
    fontSize: 19,
    fontWeight: FontWeight.w800,
    height: 1.45,
  );

  /// Big stat values ("~ 28 د", "14").
  static final statValue = _base.copyWith(
    fontSize: 21,
    fontWeight: FontWeight.w800,
    height: 1.3,
  );

  /// `h3.t`; dialog titles use [dialogTitle].
  static final titleLg = _base.copyWith(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.2,
    height: 1.4,
  );

  static final dialogTitle = _base.copyWith(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    height: 1.4,
  );

  /// Bottom sheet titles, totals, profile name.
  static final titleMd = _base.copyWith(
    fontSize: 17,
    fontWeight: FontWeight.w800,
    height: 1.4,
  );

  /// Top bar titles.
  static final topBarTitle = _base.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    height: 1.4,
  );

  /// `.sec-h h3` section headers.
  static final sectionTitle = _base.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w700,
    height: 1.4,
  );

  /// `.sname` salon names in lists.
  static final itemTitle = _base.copyWith(
    fontSize: 15.5,
    fontWeight: FontWeight.w700,
    height: 1.4,
  );

  // ---- body ---------------------------------------------------------------------
  /// Row titles, card titles (14.5 / 700).
  static final bodyStrong = _base.copyWith(
    fontSize: 14.5,
    fontWeight: FontWeight.w700,
    height: 1.5,
  );

  /// `.row-item .t` (14.5 / 600).
  static final body = _base.copyWith(
    fontSize: 14.5,
    fontWeight: FontWeight.w600,
    height: 1.5,
  );

  /// `.sub` paragraphs and dialog bodies.
  static final bodyLong = _base.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.8,
    color: AppColors.textSecondary,
  );

  /// Review text and notice bodies (13.5 / 1.8).
  static final bodySm = _base.copyWith(
    fontSize: 13.5,
    fontWeight: FontWeight.w500,
    height: 1.8,
  );

  /// Notice / info box text (13 / 1.7).
  static final note = _base.copyWith(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    height: 1.7,
    color: AppColors.textSecondary,
  );

  // ---- labels ---------------------------------------------------------------------
  /// Primary button text.
  static final button = _base.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w700,
    height: 1.3,
  );

  /// Secondary / compact button text.
  static final buttonSm = _base.copyWith(
    fontSize: 14.5,
    fontWeight: FontWeight.w700,
    height: 1.3,
  );

  /// Field labels and chip text.
  static final label = _base.copyWith(
    fontSize: 13.5,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );

  /// Input text.
  static final input = _base.copyWith(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );

  /// Links ("نسيت كلمة السر؟", "شوف الكل").
  static final link = _base.copyWith(
    fontSize: 13.5,
    fontWeight: FontWeight.w700,
    height: 1.4,
    color: AppColors.primary,
  );

  /// `.meta` rows under list items; `.wait` pills use [metaStrong].
  static final meta = _base.copyWith(
    fontSize: 12.5,
    fontWeight: FontWeight.w500,
    height: 1.5,
    color: AppColors.textSecondary,
  );

  static final metaStrong = _base.copyWith(
    fontSize: 12.5,
    fontWeight: FontWeight.w700,
    height: 1.4,
  );

  /// `.g-label` group labels.
  static final groupLabel = _base.copyWith(
    fontSize: 12.5,
    fontWeight: FontWeight.w700,
    height: 1.4,
    color: AppColors.textSecondary,
  );

  /// `.cap` captions and timestamps.
  static final caption = _base.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: AppColors.textSecondary,
  );

  /// `.badge` text.
  static final badge = _base.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w700,
    height: 1.3,
  );

  /// Small uppercase-ish tags (`.pin`, "الأسرع", counters).
  static final tag = _base.copyWith(
    fontSize: 11.5,
    fontWeight: FontWeight.w700,
    height: 1.3,
  );

  /// Bottom nav labels.
  static final navLabel = _base.copyWith(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    height: 1.3,
  );

  static final micro = _base.copyWith(
    fontSize: 10.5,
    fontWeight: FontWeight.w700,
    height: 1.3,
  );

  /// Material [TextTheme] built from the named styles, for framework widgets
  /// (dialogs, snackbars, date pickers) that read the theme.
  static TextTheme textTheme() =>
      TextTheme(
        displayLarge: displayLg,
        displayMedium: displayMd,
        displaySmall: displaySm,
        headlineLarge: headline,
        headlineMedium: pageTitle,
        headlineSmall: titleXl,
        titleLarge: titleLg,
        titleMedium: titleMd,
        titleSmall: sectionTitle,
        bodyLarge: body,
        bodyMedium: bodySm,
        bodySmall: caption,
        labelLarge: button,
        labelMedium: label,
        labelSmall: navLabel,
      ).apply(
        bodyColor: AppColors.textPrimary,
        displayColor: AppColors.textPrimary,
      );
}
