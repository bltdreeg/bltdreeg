import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import '../utils/digits.dart';
import 'app_icon.dart';
import 'app_pressable.dart';

/// Converts Arabic-Indic digits typed on Arabic keyboards to 0-9 and keeps
/// only digits. Used by phone and OTP inputs.
class LatinDigitsFormatter extends TextInputFormatter {
  const LatinDigitsFormatter();

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = Digits.onlyDigits(newValue.text);
    if (digits == newValue.text) return newValue;
    return TextEditingValue(
      text: digits,
      selection: TextSelection.collapsed(offset: digits.length),
    );
  }
}

enum _FieldState { idle, focused, error, locked }

/// Label + animated field frame + error/helper line (`.field`, `.inp`).
class AppFieldFrame extends StatelessWidget {
  const AppFieldFrame({
    required this.child,
    this.label,
    this.optional = false,
    this.focused = false,
    this.errorText,
    this.helper,
    this.locked = false,
    this.height = AppSizes.field,
    this.padding = const EdgeInsetsDirectional.symmetric(horizontal: 14),
    this.alignment = CrossAxisAlignment.center,
    super.key,
  });

  final Widget child;
  final String? label;
  final bool optional;
  final bool focused;
  final String? errorText;
  final Widget? helper;
  final bool locked;

  /// Null lets the frame grow (text areas).
  final double? height;
  final EdgeInsetsGeometry padding;
  final CrossAxisAlignment alignment;

  _FieldState get _state {
    if (locked) return _FieldState.locked;
    if (errorText != null) return _FieldState.error;
    if (focused) return _FieldState.focused;
    return _FieldState.idle;
  }

  @override
  Widget build(BuildContext context) {
    final state = _state;
    final (bg, border) = switch (state) {
      _FieldState.idle => (AppColors.surf, AppColors.border),
      _FieldState.focused => (AppColors.bg, AppColors.primary),
      _FieldState.error => (AppColors.errTint, AppColors.error),
      _FieldState.locked => (AppColors.disabled, AppColors.disabled),
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          Text.rich(
            TextSpan(
              text: label,
              children: [
                if (optional)
                  TextSpan(
                    text: ' ${context.l10n.optionalSuffix}',
                    style: AppTypography.label.copyWith(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
              ],
            ),
            style: AppTypography.label,
          ),
          const SizedBox(height: 7),
        ],
        AnimatedContainer(
          duration: AppMotion.fast,
          curve: AppMotion.standard,
          height: height,
          padding: padding,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: AppRadius.fieldAll,
            border: Border.all(color: border),
            boxShadow: state == _FieldState.focused
                ? AppShadows.focusRing
                : null,
          ),
          child: Row(
            crossAxisAlignment: alignment,
            children: [Expanded(child: child)],
          ),
        ),
        AnimatedSize(
          duration: AppMotion.fast,
          alignment: AlignmentDirectional.topStart,
          child: errorText != null
              ? Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: FieldErrorText(errorText!),
                )
              : helper != null
              ? Padding(padding: const EdgeInsets.only(top: 6), child: helper)
              : const SizedBox(width: double.infinity),
        ),
      ],
    );
  }
}

class FieldErrorText extends StatelessWidget {
  const FieldErrorText(this.message, {super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: AppIcon(
              AppAssets.iconAlertCircle,
              size: AppSizes.iconSm,
              color: AppColors.error,
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              message,
              style: AppTypography.metaStrong.copyWith(
                color: AppColors.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class AppTextField extends StatefulWidget {
  const AppTextField({
    this.controller,
    this.focusNode,
    this.label,
    this.optional = false,
    this.hint,
    this.errorText,
    this.helper,
    this.prefixIcon,
    this.prefix,
    this.suffix,
    this.isPassword = false,
    this.keyboardType,
    this.textInputAction,
    this.inputFormatters,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.enabled = true,
    this.readOnly = false,
    this.locked = false,
    this.autofocus = false,
    this.autofillHints,
    this.textDirection,
    this.textAlign = TextAlign.start,
    this.maxLines = 1,
    this.minLines,
    this.maxLength,
    this.height = AppSizes.field,
    super.key,
  });

  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String? label;
  final bool optional;
  final String? hint;
  final String? errorText;
  final Widget? helper;

  /// Leading icon asset.
  final String? prefixIcon;

  /// Leading widget such as the `+20` country prefix.
  final Widget? prefix;
  final Widget? suffix;
  final bool isPassword;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final List<TextInputFormatter>? inputFormatters;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final bool enabled;
  final bool readOnly;

  /// Disabled look for identity fields (verified phone, frame 36).
  final bool locked;
  final bool autofocus;
  final Iterable<String>? autofillHints;
  final TextDirection? textDirection;
  final TextAlign textAlign;
  final int? maxLines;
  final int? minLines;
  final int? maxLength;
  final double? height;

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  FocusNode? _ownedFocus;
  FocusNode get _focus => widget.focusNode ?? (_ownedFocus ??= FocusNode());

  bool _obscured = true;
  bool _hasFocus = false;

  @override
  void initState() {
    super.initState();
    _focus.addListener(_onFocus);
  }

  @override
  void didUpdateWidget(covariant AppTextField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.focusNode != widget.focusNode) {
      (oldWidget.focusNode ?? _ownedFocus)?.removeListener(_onFocus);
      _focus.addListener(_onFocus);
    }
  }

  void _onFocus() {
    if (_hasFocus != _focus.hasFocus) {
      setState(() => _hasFocus = _focus.hasFocus);
    }
  }

  @override
  void dispose() {
    _focus.removeListener(_onFocus);
    _ownedFocus?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final multiline = widget.maxLines != 1;
    final iconColor = widget.locked
        ? AppColors.textDisabled
        : AppColors.textSecondary;

    final field = TextField(
      controller: widget.controller,
      focusNode: _focus,
      enabled: widget.enabled && !widget.locked,
      readOnly: widget.readOnly,
      autofocus: widget.autofocus,
      obscureText: widget.isPassword && _obscured,
      keyboardType: widget.keyboardType,
      textInputAction: widget.textInputAction,
      inputFormatters: widget.inputFormatters,
      onChanged: widget.onChanged,
      onSubmitted: widget.onSubmitted,
      onTap: widget.onTap,
      autofillHints: widget.autofillHints,
      textDirection: widget.textDirection,
      textAlign: widget.textAlign,
      maxLines: widget.isPassword ? 1 : widget.maxLines,
      minLines: widget.minLines,
      maxLength: widget.maxLength,
      style: AppTypography.input.copyWith(
        color: widget.locked ? AppColors.textDisabled : AppColors.textPrimary,
        fontWeight: widget.locked ? FontWeight.w700 : FontWeight.w600,
        letterSpacing: widget.isPassword && _obscured ? 3 : null,
      ),
      cursorColor: AppColors.primary,
      decoration: InputDecoration(
        hintText: widget.hint,
        counterText: '',
        isCollapsed: true,
        contentPadding: multiline
            ? const EdgeInsets.symmetric(vertical: 13)
            : EdgeInsets.zero,
      ),
    );

    return AppFieldFrame(
      label: widget.label,
      optional: widget.optional,
      focused: _hasFocus,
      errorText: widget.errorText,
      helper: widget.helper,
      locked: widget.locked,
      height: multiline ? null : widget.height,
      alignment: multiline
          ? CrossAxisAlignment.start
          : CrossAxisAlignment.center,
      child: Row(
        crossAxisAlignment: multiline
            ? CrossAxisAlignment.start
            : CrossAxisAlignment.center,
        children: [
          if (widget.prefixIcon != null) ...[
            AppIcon(
              widget.prefixIcon!,
              size: AppSizes.iconSm,
              color: iconColor,
            ),
            const SizedBox(width: 10),
          ],
          if (widget.prefix != null) ...[
            widget.prefix!,
            const SizedBox(width: 10),
          ],
          Expanded(child: field),
          if (widget.isPassword)
            AppPressable(
              onTap: () => setState(() => _obscured = !_obscured),
              semanticLabel: _obscured
                  ? l10n.a11yShowPassword
                  : l10n.a11yHidePassword,
              child: Padding(
                padding: const EdgeInsetsDirectional.only(start: 10),
                child: AppIcon(
                  _obscured ? AppAssets.iconEye : AppAssets.iconEyeOff,
                  size: AppSizes.iconSm + 2,
                  color: iconColor,
                ),
              ),
            ),
          if (widget.suffix != null) ...[
            const SizedBox(width: 10),
            widget.suffix!,
          ],
        ],
      ),
    );
  }
}

/// `+20 🇪🇬` prefix with the separator line, always LTR.
class CountryCodePrefix extends StatelessWidget {
  const CountryCodePrefix({this.muted = false, super.key});

  final bool muted;

  static const code = '+20';

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsDirectional.only(end: 10),
      decoration: BoxDecoration(
        border: BorderDirectional(
          end: BorderSide(
            color: muted ? const Color(0xFFD6DADD) : AppColors.border,
          ),
        ),
      ),
      child: Text(
        '$code 🇪🇬',
        textDirection: TextDirection.ltr,
        style: AppTypography.label.copyWith(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: muted ? AppColors.textDisabled : AppColors.textSecondary,
        ),
      ),
    );
  }
}

/// Egyptian mobile input: LTR digits, Arabic-Indic digits normalized.
class AppPhoneField extends StatelessWidget {
  const AppPhoneField({
    this.controller,
    this.label,
    this.errorText,
    this.onChanged,
    this.onSubmitted,
    this.locked = false,
    this.suffix,
    this.helper,
    this.autofocus = false,
    this.textInputAction,
    super.key,
  });

  final TextEditingController? controller;
  final String? label;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool locked;
  final Widget? suffix;
  final Widget? helper;
  final bool autofocus;
  final TextInputAction? textInputAction;

  @override
  Widget build(BuildContext context) {
    return AppTextField(
      controller: controller,
      label: label,
      errorText: errorText,
      helper: helper,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      locked: locked,
      autofocus: autofocus,
      suffix: suffix,
      prefix: CountryCodePrefix(muted: locked),
      keyboardType: TextInputType.phone,
      textInputAction: textInputAction,
      textDirection: TextDirection.ltr,
      // Keep the number next to the +20 prefix in both directions.
      textAlign: context.isRtl ? TextAlign.right : TextAlign.left,
      autofillHints: const [AutofillHints.telephoneNumberNational],
      inputFormatters: [
        const LatinDigitsFormatter(),
        LengthLimitingTextInputFormatter(11),
      ],
      hint: '01X XXXX XXXX',
    );
  }
}

class AppSearchField extends StatefulWidget {
  const AppSearchField({
    required this.hint,
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.height = AppSizes.buttonMd,
    this.focusNode,
    super.key,
  });

  final String hint;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  /// With [readOnly], turns the field into a button (home → search tab).
  final VoidCallback? onTap;
  final bool enabled;
  final bool readOnly;
  final bool autofocus;
  final double height;
  final FocusNode? focusNode;

  @override
  State<AppSearchField> createState() => _AppSearchFieldState();
}

class _AppSearchFieldState extends State<AppSearchField> {
  TextEditingController? _owned;
  TextEditingController get _controller =>
      widget.controller ?? (_owned ??= TextEditingController());

  @override
  void initState() {
    super.initState();
    _controller.addListener(_rebuild);
  }

  void _rebuild() => setState(() {});

  @override
  void dispose() {
    _controller.removeListener(_rebuild);
    _owned?.dispose();
    super.dispose();
  }

  void _clear() {
    _controller.clear();
    widget.onChanged?.call('');
  }

  @override
  Widget build(BuildContext context) {
    final field = AppTextField(
      controller: _controller,
      focusNode: widget.focusNode,
      hint: widget.hint,
      prefixIcon: AppAssets.iconSearch,
      enabled: widget.enabled,
      readOnly: widget.readOnly,
      autofocus: widget.autofocus,
      onChanged: widget.onChanged,
      onSubmitted: widget.onSubmitted,
      onTap: widget.onTap,
      height: widget.height,
      textInputAction: TextInputAction.search,
      suffix: _controller.text.isEmpty
          ? null
          : AppPressable(
              onTap: _clear,
              semanticLabel: context.l10n.a11yClearSearch,
              child: const AppIcon(
                AppAssets.iconClose,
                size: AppSizes.iconSm,
                color: AppColors.textSecondary,
              ),
            ),
    );

    final body = AnimatedOpacity(
      duration: AppMotion.fast,
      opacity: widget.enabled ? 1 : 0.55,
      child: field,
    );

    if (widget.readOnly && widget.onTap != null) {
      return AppPressable(
        onTap: widget.onTap,
        semanticLabel: widget.hint,
        child: AbsorbPointer(child: body),
      );
    }
    return body;
  }
}
