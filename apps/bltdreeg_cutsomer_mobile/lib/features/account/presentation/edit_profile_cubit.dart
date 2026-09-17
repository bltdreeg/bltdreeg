import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/error/failures.dart';
import '../../../core/utils/result.dart';
import '../../auth/domain/entities/user.dart';
import '../../auth/domain/repositories/auth_repository.dart';

enum EditProfileStatus { editing, saving, saved, deleting, deleted }

final class EditProfileState extends Equatable {
  const EditProfileState({
    required this.firstName,
    required this.lastName,
    this.email = '',
    this.birthDate,
    this.areaName,
    this.status = EditProfileStatus.editing,
    this.failure,
  });

  EditProfileState.fromUser(User user)
    : this(
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email ?? '',
        birthDate: user.birthDate,
        areaName: user.areaName,
      );

  final String firstName;
  final String lastName;
  final String email;
  final DateTime? birthDate;
  final String? areaName;
  final EditProfileStatus status;
  final Failure? failure;

  bool get isBusy =>
      status == EditProfileStatus.saving ||
      status == EditProfileStatus.deleting;

  bool get canSave => firstName.trim().isNotEmpty && !isBusy;

  EditProfileState copyWith({
    String? firstName,
    String? lastName,
    String? email,
    DateTime? birthDate,
    bool clearBirthDate = false,
    String? areaName,
    EditProfileStatus? status,
    Failure? failure,
    bool clearFailure = false,
  }) => EditProfileState(
    firstName: firstName ?? this.firstName,
    lastName: lastName ?? this.lastName,
    email: email ?? this.email,
    birthDate: clearBirthDate ? null : birthDate ?? this.birthDate,
    areaName: areaName ?? this.areaName,
    status: status ?? this.status,
    failure: clearFailure ? null : failure ?? this.failure,
  );

  @override
  List<Object?> get props => [
    firstName,
    lastName,
    email,
    birthDate,
    areaName,
    status,
    failure,
  ];
}

/// Frame 36. The phone is the account identity and isn't edited here.
class EditProfileCubit extends Cubit<EditProfileState> {
  EditProfileCubit({required User user, required this._repository})
    : super(EditProfileState.fromUser(user));

  final AuthRepository _repository;

  void setFirstName(String value) => emit(state.copyWith(firstName: value));
  void setLastName(String value) => emit(state.copyWith(lastName: value));
  void setEmail(String value) => emit(state.copyWith(email: value));

  void setBirthDate(DateTime? value) =>
      emit(state.copyWith(birthDate: value, clearBirthDate: value == null));

  void setAreaName(String value) => emit(state.copyWith(areaName: value));

  Future<void> save() async {
    if (!state.canSave) return;
    emit(state.copyWith(status: EditProfileStatus.saving, clearFailure: true));
    final email = state.email.trim();
    final result = await _repository.updateProfile(
      ProfileUpdate(
        firstName: state.firstName.trim(),
        lastName: state.lastName.trim(),
        email: email.isEmpty ? null : email,
        birthDate: state.birthDate,
        areaName: state.areaName,
      ),
    );
    if (isClosed) return;
    emit(switch (result) {
      Ok() => state.copyWith(status: EditProfileStatus.saved),
      Err(:final failure) => state.copyWith(
        status: EditProfileStatus.editing,
        failure: failure,
      ),
    });
  }

  /// Signs out on success: the repository clears the device session.
  Future<void> deleteAccount() async {
    if (state.isBusy) return;
    emit(
      state.copyWith(status: EditProfileStatus.deleting, clearFailure: true),
    );
    final result = await _repository.deleteAccount();
    if (isClosed) return;
    emit(switch (result) {
      Ok() => state.copyWith(status: EditProfileStatus.deleted),
      Err(:final failure) => state.copyWith(
        status: EditProfileStatus.editing,
        failure: failure,
      ),
    });
  }

  void acknowledgeSaved() =>
      emit(state.copyWith(status: EditProfileStatus.editing));
}
