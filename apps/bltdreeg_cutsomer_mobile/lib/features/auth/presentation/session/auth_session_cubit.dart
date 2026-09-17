import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecase/usecase.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/auth_usecases.dart';

/// App-wide session state (signed in / guest / signed out). The router
/// listens to it to guard protected routes.
class AuthSessionCubit extends Cubit<SessionSnapshot> {
  AuthSessionCubit({
    required AuthRepository repository,
    required this._continueAsGuest,
    required this._signOut,
  }) : super(repository.currentSession) {
    _subscription = repository.watchSession().listen(emit);
  }

  final ContinueAsGuest _continueAsGuest;
  final SignOut _signOut;
  late final StreamSubscription<SessionSnapshot> _subscription;

  /// Notifies go_router whenever the session changes.
  late final Listenable routerRefresh = _StreamListenable(stream);

  Future<void> continueAsGuest() => _continueAsGuest(const NoParams());

  Future<void> signOut() => _signOut(const NoParams());

  @override
  Future<void> close() async {
    await _subscription.cancel();
    return super.close();
  }
}

final class _StreamListenable extends ChangeNotifier {
  _StreamListenable(Stream<Object?> stream) {
    stream.listen((_) => notifyListeners());
  }
}
