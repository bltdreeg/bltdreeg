import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../core/di/injection.dart';
import '../core/localization/generated/app_localizations.dart';
import '../core/localization/locale_cubit.dart';
import '../core/network/connectivity_cubit.dart';
import '../core/router/app_router.dart';
import '../core/theme/app_theme.dart';
import '../features/auth/presentation/session/auth_session_cubit.dart';

class BeltadreegApp extends StatelessWidget {
  const BeltadreegApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<LocaleCubit>.value(value: sl<LocaleCubit>()),
        BlocProvider<ConnectivityCubit>.value(value: sl<ConnectivityCubit>()),
        BlocProvider<AuthSessionCubit>.value(value: sl<AuthSessionCubit>()),
      ],
      child: BlocBuilder<LocaleCubit, Locale>(
        builder: (context, locale) => MaterialApp.router(
          onGenerateTitle: (context) => AppLocalizations.of(context).appName,
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light(),
          locale: locale,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          routerConfig: sl<AppRouter>().config,
          // Default status bar for every screen, including those without an
          // AppBar. Dark screens (photo viewer) override it deeper.
          builder: (context, child) => AnnotatedRegion<SystemUiOverlayStyle>(
            value: AppTheme.systemOverlay,
            child: child!,
          ),
        ),
      ),
    );
  }
}
