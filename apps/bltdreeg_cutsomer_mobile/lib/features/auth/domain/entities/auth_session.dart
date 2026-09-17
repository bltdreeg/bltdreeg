import 'package:equatable/equatable.dart';

import 'user.dart';

enum AuthStatus {
  /// Session not restored yet (app start).
  unknown,
  unauthenticated,

  /// Chose "browse without an account" (frame 43).
  guest,
  authenticated,
}

final class AuthSession extends Equatable {
  const AuthSession({required this.accessToken, required this.user});

  final String accessToken;
  final User user;

  @override
  List<Object?> get props => [accessToken, user];
}

/// What the app currently knows about who is using it.
final class SessionSnapshot extends Equatable {
  const SessionSnapshot({required this.status, this.user});

  const SessionSnapshot.unknown() : this(status: AuthStatus.unknown);

  final AuthStatus status;
  final User? user;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  @override
  List<Object?> get props => [status, user];
}
