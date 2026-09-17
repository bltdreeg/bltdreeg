import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import '../utils/validators.dart';
import 'app_text_field.dart';

/// OTP entry as separate boxes (frames 19–20).
///
/// A single invisible [TextField] owns input, paste and SMS autofill
/// (`oneTimeCode`); the boxes only render its value. Boxes always read
/// left-to-right, even in Arabic.
class AppOtpInput extends StatefulWidget {
  const AppOtpInput({
    this.length = Validators.otpLength,
    this.controller,
    this.onChanged,
    this.onCompleted,
    this.hasError = false,
    this.isSuccess = false,
    this.enabled = true,
    this.autofocus = true,
    super.key,
  });

  final int length;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onCompleted;
  final bool hasError;

  /// Green confirmation state shown briefly before navigating on.
  final bool isSuccess;
  final bool enabled;
  final bool autofocus;

  @override
  State<AppOtpInput> createState() => _AppOtpInputState();
}

class _AppOtpInputState extends State<AppOtpInput>
    with SingleTickerProviderStateMixin {
  TextEditingController? _owned;
  TextEditingController get _controller =>
      widget.controller ?? (_owned ??= TextEditingController());

  final _focus = FocusNode();

  late final AnimationController _caret = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1000),
  );

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onText);
    _focus.addListener(_onFocus);
  }

  void _onFocus() {
    if (_focus.hasFocus && !MediaQuery.disableAnimationsOf(context)) {
      _caret.repeat();
    } else {
      _caret.stop();
    }
    setState(() {});
  }

  void _onText() {
    setState(() {});
    final text = _controller.text;
    widget.onChanged?.call(text);
    if (text.length == widget.length) widget.onCompleted?.call(text);
  }

  @override
  void dispose() {
    _controller.removeListener(_onText);
    _owned?.dispose();
    _focus.dispose();
    _caret.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final text = _controller.text;
    final activeIndex = text.length.clamp(0, widget.length - 1);

    return Directionality(
      textDirection: TextDirection.ltr,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.enabled ? _focus.requestFocus : null,
        child: Stack(
          children: [
            Row(
              children: [
                for (var i = 0; i < widget.length; i++) ...[
                  if (i > 0) const SizedBox(width: 10),
                  Expanded(
                    child: _OtpBox(
                      digit: i < text.length ? text[i] : null,
                      active:
                          _focus.hasFocus &&
                          i == activeIndex &&
                          text.length < widget.length,
                      error: widget.hasError,
                      success: widget.isSuccess,
                      caret: _caret,
                    ),
                  ),
                ],
              ],
            ),
            // Invisible input covering the boxes.
            Positioned.fill(
              child: Opacity(
                opacity: 0,
                child: TextField(
                  controller: _controller,
                  focusNode: _focus,
                  enabled: widget.enabled,
                  autofocus: widget.autofocus,
                  keyboardType: TextInputType.number,
                  autofillHints: const [AutofillHints.oneTimeCode],
                  showCursor: false,
                  enableInteractiveSelection: false,
                  inputFormatters: [
                    const LatinDigitsFormatter(),
                    LengthLimitingTextInputFormatter(widget.length),
                  ],
                  decoration: const InputDecoration(counterText: ''),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OtpBox extends StatelessWidget {
  const _OtpBox({
    required this.digit,
    required this.active,
    required this.error,
    required this.success,
    required this.caret,
  });

  final String? digit;
  final bool active;
  final bool error;
  final bool success;
  final Animation<double> caret;

  @override
  Widget build(BuildContext context) {
    final (bg, border) = success
        ? (AppColors.okTint, AppColors.success)
        : error
        ? (AppColors.errTint, AppColors.error)
        : active
        ? (AppColors.bg, AppColors.primary)
        : (AppColors.surf, AppColors.border);

    return AnimatedScale(
      duration: AppMotion.medium,
      curve: AppMotion.emphasized,
      scale: success ? 1.06 : 1,
      child: AnimatedContainer(
        duration: AppMotion.fast,
        height: 64,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: AppRadius.mdAll,
          border: Border.all(color: border, width: 1.5),
          boxShadow: active && !error ? AppShadows.focusRing : null,
        ),
        alignment: Alignment.center,
        child: digit != null
            ? TweenAnimationBuilder<double>(
                key: ValueKey(digit),
                tween: Tween(begin: 0.6, end: 1),
                duration: AppMotion.fast,
                curve: AppMotion.emphasized,
                builder: (_, scale, child) =>
                    Transform.scale(scale: scale, child: child),
                child: Text(
                  digit!,
                  style: AppTypography.statValue.copyWith(
                    fontSize: 24,
                    color: success
                        ? AppColors.okDark
                        : error
                        ? AppColors.errText
                        : AppColors.textPrimary,
                  ),
                ),
              )
            : active
            ? FadeTransition(
                opacity: caret.drive(
                  TweenSequence([
                    TweenSequenceItem(tween: ConstantTween(1.0), weight: 1),
                    TweenSequenceItem(tween: ConstantTween(0.0), weight: 1),
                  ]),
                ),
                child: Container(
                  width: 2,
                  height: 26,
                  color: AppColors.primary,
                ),
              )
            : null,
      ),
    );
  }
}
