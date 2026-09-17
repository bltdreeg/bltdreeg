import 'package:flutter/painting.dart';

/// Color tokens from the `:root` block of the design board (`all.html`),
/// plus the inline one-off shades the board uses repeatedly.
///
/// Raw tokens keep the CSS names so designers and developers can map them
/// 1:1. Widgets should prefer the semantic aliases below.
abstract final class AppColors {
  // ---- raw tokens (CSS :root) ---------------------------------------------
  static const teal = Color(0xFF0F766E); // --teal
  static const tealDark = Color(0xFF0B5A54); // --teal-d
  static const tealTint = Color(0xFFE6F0EF); // --teal-t
  static const tealTint2 = Color(0xFFD3E5E3); // --teal-t2

  static const bg = Color(0xFFFFFFFF); // --bg
  static const surf = Color(0xFFF7F8FA); // --surf
  static const tx = Color(0xFF0E0F11); // --tx
  static const tx2 = Color(0xFF6B7280); // --tx2
  static const line = Color(0xFFE5E7EB); // --line
  static const dis = Color(0xFFE7EAEC); // --dis
  static const dist = Color(0xFFA5ABB3); // --dist

  static const ok = Color(0xFF16A34A); // --ok
  static const okDark = Color(0xFF15803D); // --okd
  static const okTint = Color(0xFFE7F4EA); // --ok-t

  static const warn = Color(0xFFF59E0B); // --warn
  static const warnTint = Color(0xFFFDF1DE); // --warn-t

  static const err = Color(0xFFEF4444); // --err
  static const errTint = Color(0xFFFDEAEA); // --err-t

  // ---- recurring inline shades ----------------------------------------------
  static const okText2 = Color(0xFF2E7D46); // secondary text on ok tint
  static const okBorder = Color(0xFFCBE7D3);
  static const warnText = Color(0xFFB45309); // text/icons on warn tint
  static const warnBorder = Color(0xFFF5DDB4);
  static const onWarn = Color(0xFF3D2A05); // text on solid warn
  static const errText = Color(0xFFB91C1C); // text on err tint
  static const errBorder = Color(0xFFF3CFCF); // outline of destructive buttons
  static const placeholderIcon = Color(0xFFC2C7CE); // icons in empty thumbs

  static const scrim = Color(0x730E0F11); // rgba(14,15,17,.45)
  static const focusRing = Color(0x1F0F766E); // rgba(15,118,110,.12)
  static const tealDivider = Color(0x260B5A54); // rgba(11,90,84,.15)
  static const navBackground = Color(0xF7FFFFFF); // rgba(255,255,255,.97)

  // ---- semantic aliases -------------------------------------------------------
  static const primary = teal;
  static const primaryPressed = tealDark;
  static const onPrimary = bg;

  static const background = bg;
  static const surface = bg;
  static const surfaceMuted = surf;

  static const textPrimary = tx;
  static const textSecondary = tx2;
  static const textDisabled = dist;
  static const textOnPrimaryTint = tealDark;

  static const divider = line;
  static const border = line;
  static const disabled = dis;
  static const onDisabled = dist;

  static const success = ok;
  static const successDark = okDark;
  static const successTint = okTint;

  static const warning = warn;
  static const warningTint = warnTint;
  static const warningText = warnText;

  static const error = err;
  static const errorTint = errTint;
  static const errorText = errText;

  static const rating = warn;
}
