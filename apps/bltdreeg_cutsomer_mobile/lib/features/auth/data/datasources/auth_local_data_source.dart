import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/database/app_database.dart';
import '../../../../core/storage/app_preferences.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/entities/user.dart';
import '../models/auth_models.dart';

/// Device-side session storage: the token goes to the platform keychain /
/// keystore, the (non-secret) profile to the drift cache so it's available
/// offline immediately at launch.
abstract interface class AuthLocalDataSource {
  Future<AuthSession?> readSession();
  Future<void> saveSession(AuthSession session);
  Future<void> saveUser(User user);
  Future<void> clearSession();

  bool get guestMode;
  Future<void> setGuestMode({required bool value});
}

final class SecureAuthLocalDataSource implements AuthLocalDataSource {
  SecureAuthLocalDataSource({
    required AppDatabase database,
    required AppPreferences preferences,
    FlutterSecureStorage? secureStorage,
  }) : _db = database,
       _prefs = preferences,
       _secure = secureStorage ?? const FlutterSecureStorage();

  static const _tokenKey = 'auth.access_token';
  static const _userCacheKey = 'auth:user';

  final AppDatabase _db;
  final AppPreferences _prefs;
  final FlutterSecureStorage _secure;

  @override
  Future<AuthSession?> readSession() async {
    final token = await _secure.read(key: _tokenKey);
    final cached = await _db.readCache(_userCacheKey);
    if (token == null || cached == null) return null;
    return AuthSession(
      accessToken: token,
      user: UserModel.fromJson(
        jsonDecode(cached.payload) as Map<String, Object?>,
      ),
    );
  }

  @override
  Future<void> saveSession(AuthSession session) async {
    await _secure.write(key: _tokenKey, value: session.accessToken);
    await saveUser(session.user);
  }

  @override
  Future<void> saveUser(User user) =>
      _db.writeCache(_userCacheKey, jsonEncode(UserModel.toJson(user)));

  @override
  Future<void> clearSession() async {
    await _secure.delete(key: _tokenKey);
    await _db.deleteCache(_userCacheKey);
  }

  @override
  bool get guestMode => _prefs.guestMode;

  @override
  Future<void> setGuestMode({required bool value}) =>
      _prefs.setGuestMode(value: value);
}

/// For tests and previews.
final class InMemoryAuthLocalDataSource implements AuthLocalDataSource {
  AuthSession? session;
  @override
  bool guestMode = false;

  @override
  Future<AuthSession?> readSession() async => session;

  @override
  Future<void> saveSession(AuthSession value) async => session = value;

  @override
  Future<void> saveUser(User user) async {
    final current = session;
    if (current != null) {
      session = AuthSession(accessToken: current.accessToken, user: user);
    }
  }

  @override
  Future<void> clearSession() async => session = null;

  @override
  Future<void> setGuestMode({required bool value}) async => guestMode = value;
}
