import 'package:bltdreeg_cutsomer_mobile/core/router/app_router.dart';
import 'package:flutter_test/flutter_test.dart';

/// Deep links arrive as full `beltadreeg://` URIs from both platforms, but
/// go_router only matches paths — so the scheme's host is the first segment.
void main() {
  String? normalize(String link) => AppRouter.normalizeAppLink(Uri.parse(link));

  test('host becomes the first path segment', () {
    expect(normalize('beltadreeg://salon/sl-2'), '/salon/sl-2');
    expect(normalize('beltadreeg://home'), '/home');
    expect(
      normalize('beltadreeg://booking/bk-1/confirmed'),
      '/booking/bk-1/confirmed',
    );
  });

  test('query strings survive', () {
    expect(
      normalize('beltadreeg://search?open=1&sort=nearest'),
      '/search?open=1&sort=nearest',
    );
  });

  test('ordinary in-app locations are left alone', () {
    expect(normalize('/salon/sl-2'), isNull);
    expect(normalize('/home'), isNull);
    expect(normalize('https://beltadreeg.com/salon/sl-2'), isNull);
  });
}
