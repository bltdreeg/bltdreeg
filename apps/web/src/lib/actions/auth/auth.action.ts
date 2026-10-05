// أفعال المصادقة: async functions عادية بتكلم Laravel عن طريق apiClient (مفيش server actions ولا route handlers).
// بتتنادى من React Query hooks بس. فتح الجلسة (حفظ التوكن) بيحصل هنا.
import { apiClient } from "@/lib/api";
import type {
  AuthOptions,
  AuthSession,
  ForgotPasswordDto,
  LoginDto,
  OtpChallenge,
  OtpLoginDto,
  RegisterDto,
  ResendOtpDto,
  ResetPasswordDto,
  ResetToken,
  SocialLoginDto,
  VerifyOtpDto,
  VerifyResetCodeDto,
} from "@/lib/types/auth";
import {
  identifierField,
  mapAuthOptions,
  mapCustomer,
  mapOtpChallenge,
  type RawAuthOptions,
  type RawAuthSession,
  type RawOtpChallenge,
} from "@/lib/utils/auth/laravel-mappers";
import { tokenStorage } from "@/lib/utils/auth/token-storage";

const DEVICE_NAME = "web";

function openSession(raw: RawAuthSession, remember = true): AuthSession {
  tokenStorage.setSession(raw.access_token, raw.user.onboarding.complete, remember);
  return { user: mapCustomer(raw.user) };
}

export async function getAuthOptions(): Promise<AuthOptions> {
  return mapAuthOptions(await apiClient.get<RawAuthOptions>("/auth/options"));
}

export async function login(dto: LoginDto): Promise<AuthSession> {
  const raw = await apiClient.post<RawAuthSession>("/auth/login", {
    ...identifierField(dto.identifier),
    password: dto.password,
    device_name: DEVICE_NAME,
  });
  return openSession(raw, dto.rememberMe ?? true);
}

export async function register(dto: RegisterDto): Promise<OtpChallenge> {
  return mapOtpChallenge(
    await apiClient.post<RawOtpChallenge>("/auth/register", {
      first_name: dto.firstName,
      last_name: dto.lastName,
      phone: dto.phone,
      email: dto.email || undefined,
      password: dto.password,
      accepted_terms: dto.acceptedTerms,
      channel: dto.channel,
    }),
  );
}

export async function sendLoginOtp(dto: OtpLoginDto): Promise<OtpChallenge> {
  return mapOtpChallenge(await apiClient.post<RawOtpChallenge>("/auth/otp", dto));
}

export async function resendOtp(dto: ResendOtpDto): Promise<OtpChallenge> {
  return mapOtpChallenge(await apiClient.post<RawOtpChallenge>("/auth/otp/resend", dto));
}

export async function verifyOtp(dto: VerifyOtpDto): Promise<AuthSession> {
  const raw = await apiClient.post<RawAuthSession>("/auth/otp/verify", {
    phone: dto.phone,
    code: dto.code,
    purpose: dto.purpose,
    device_name: DEVICE_NAME,
  });
  return openSession(raw, dto.rememberMe ?? true);
}

export async function socialLogin(provider: "google" | "apple", dto: SocialLoginDto): Promise<AuthSession> {
  const raw = await apiClient.post<RawAuthSession>(`/auth/social/${provider}`, {
    id_token: dto.idToken,
    nonce: dto.nonce,
    first_name: dto.firstName,
    last_name: dto.lastName,
    device_name: DEVICE_NAME,
  });
  return openSession(raw, dto.rememberMe ?? true);
}

export async function forgotPassword(dto: ForgotPasswordDto): Promise<OtpChallenge> {
  return mapOtpChallenge(
    await apiClient.post<RawOtpChallenge>("/auth/password/forgot", {
      ...identifierField(dto.identifier),
      channel: dto.channel,
    }),
  );
}

export async function verifyResetCode(dto: VerifyResetCodeDto): Promise<ResetToken> {
  const raw = await apiClient.post<{ reset_token: string; expires_at: string }>("/auth/password/verify", {
    ...identifierField(dto.identifier),
    code: dto.code,
  });
  return { resetToken: raw.reset_token, expiresAt: raw.expires_at };
}

export async function resetPassword(dto: ResetPasswordDto): Promise<AuthSession> {
  const raw = await apiClient.post<RawAuthSession>("/auth/password/reset", {
    reset_token: dto.resetToken,
    password: dto.password,
    password_confirmation: dto.passwordConfirmation,
    device_name: DEVICE_NAME,
  });
  return openSession(raw);
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post<void>("/auth/logout");
  } finally {
    // حتى لو التوكن منتهي أو الشبكة وقعت، لازم الجلسة تتمسح محلياً
    tokenStorage.clear();
  }
}
