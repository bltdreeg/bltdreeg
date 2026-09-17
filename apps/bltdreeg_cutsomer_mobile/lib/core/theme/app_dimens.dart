import 'package:flutter/widgets.dart';

import 'app_colors.dart';

/// Corner radii (`--r-card`, `--r-field`, `--r-sheet`, `--r-pill`) and the
/// other radii the board uses consistently.
abstract final class AppRadius {
  static const double card = 14; // --r-card
  static const double field = 10; // --r-field
  static const double sheet = 22; // --r-sheet
  static const double pill = 999; // --r-pill

  static const double xs = 6; // checkbox, small tags
  static const double sm = 8; // wait pills, badges
  static const double md = 12; // thumbs, info boxes, segmented tabs
  static const double lg = 16; // queue card
  static const double dialog = 18;

  static const cardAll = BorderRadius.all(Radius.circular(card));
  static const fieldAll = BorderRadius.all(Radius.circular(field));
  static const pillAll = BorderRadius.all(Radius.circular(pill));
  static const smAll = BorderRadius.all(Radius.circular(sm));
  static const mdAll = BorderRadius.all(Radius.circular(md));
  static const lgAll = BorderRadius.all(Radius.circular(lg));
  static const dialogAll = BorderRadius.all(Radius.circular(dialog));
  static const sheetTop = BorderRadius.vertical(top: Radius.circular(sheet));
}

abstract final class AppShadows {
  /// `--shadow-float`: sticky footers and the bottom nav (casts upward).
  static const float = [
    BoxShadow(color: Color(0x120E0F11), offset: Offset(0, -6), blurRadius: 24),
  ];

  /// `--shadow-pop`: dialogs and bottom sheets.
  static const pop = [
    BoxShadow(color: Color(0x2E0E0F11), offset: Offset(0, 18), blurRadius: 44),
  ];

  /// Floating status pins on photos.
  static const pin = [
    BoxShadow(color: Color(0x1A0E0F11), offset: Offset(0, 2), blurRadius: 6),
  ];

  /// Selected segment in segmented tabs.
  static const segment = [
    BoxShadow(color: Color(0x1A0E0F11), offset: Offset(0, 1), blurRadius: 3),
  ];

  /// 3px focus ring around focused inputs.
  static const focusRing = [
    BoxShadow(color: AppColors.focusRing, spreadRadius: 3),
  ];
}

abstract final class AppSpacing {
  static const double xxs = 2;
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;

  /// Horizontal page gutter (`.pad`).
  static const double gutter = 20;
  static const pageH = EdgeInsets.symmetric(horizontal: gutter);
}

/// Motion tokens. Everything animated reads from here so pacing stays
/// consistent and reduced-motion handling has one place to look.
abstract final class AppMotion {
  static const press = Duration(milliseconds: 90);
  static const release = Duration(milliseconds: 160);
  static const fast = Duration(milliseconds: 180);
  static const medium = Duration(milliseconds: 280);
  static const slow = Duration(milliseconds: 480);
  static const celebrate = Duration(milliseconds: 900);

  static const pressedScale = 0.97;

  static const standard = Curves.easeOutCubic;
  static const emphasized = Curves.easeOutBack;
}

abstract final class AppSizes {
  static const double buttonLg = 52;
  static const double buttonMd = 48;
  static const double buttonSm = 44;
  static const double buttonXs = 38;
  static const double field = 52;
  static const double iconSm = 15;
  static const double icon = 20;
  static const double iconLg = 24;
  static const double topBarButton = 38;
  static const double bottomNavHeight = 68;
}
