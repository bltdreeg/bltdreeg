import 'package:equatable/equatable.dart';

/// Server content available in both app languages (area names, service
/// names). Salon names are *not* localized: they stay as the owner wrote them.
final class LocalizedText extends Equatable {
  const LocalizedText({required this.ar, required this.en});

  const LocalizedText.same(String value) : ar = value, en = value;

  final String ar;
  final String en;

  String of(String languageCode) => languageCode == 'ar' ? ar : en;

  Map<String, Object?> toJson() => {'ar': ar, 'en': en};

  static LocalizedText fromJson(Map<String, Object?> json) =>
      LocalizedText(ar: json['ar']! as String, en: json['en']! as String);

  @override
  List<Object?> get props => [ar, en];
}
