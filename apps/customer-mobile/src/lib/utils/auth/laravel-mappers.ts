// تحويل استجابات Laravel (snake_case) لأنواع الويب (camelCase)
import type { AuthOptions, Customer, OtpChallenge } from "../../types/auth/index.ts";

export interface RawCustomer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  email: string | null;
  email_verified: boolean;
  pending_email: string | null;
  birth_date: string | null;
  has_password: boolean;
  social_providers: string[];
  location: { lat: number; lng: number; source: "gps" | "ip"; updated_at: string | null } | null;
  onboarding: { complete: boolean; missing: Customer["onboarding"]["missing"]; skippable: Customer["onboarding"]["skippable"] };
}

export interface RawAuthSession {
  access_token: string;
  token_type: string;
  expires_at: string | null;
  user: RawCustomer;
}

export interface RawOtpChallenge {
  phone?: string;
  email?: string;
  purpose: OtpChallenge["purpose"];
  channel: OtpChallenge["channel"];
  code_length: number;
  expires_at: string;
  resend_available_at: string;
  attempts_left: number;
}

export interface RawAuthOptions {
  otp_channels: AuthOptions["otpChannels"];
  social_providers: AuthOptions["socialProviders"];
  terms_version: string | null;
}

export function mapCustomer(raw: RawCustomer): Customer {
  return {
    id: raw.id,
    firstName: raw.first_name,
    lastName: raw.last_name,
    phone: raw.phone,
    phoneVerified: raw.phone_verified,
    email: raw.email,
    emailVerified: raw.email_verified,
    pendingEmail: raw.pending_email,
    birthDate: raw.birth_date,
    hasPassword: raw.has_password,
    socialProviders: raw.social_providers,
    location: raw.location
      ? { lat: raw.location.lat, lng: raw.location.lng, source: raw.location.source, updatedAt: raw.location.updated_at }
      : null,
    onboarding: raw.onboarding,
  };
}

export function mapOtpChallenge(raw: RawOtpChallenge): OtpChallenge {
  return {
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    purpose: raw.purpose,
    channel: raw.channel,
    codeLength: raw.code_length,
    expiresAt: raw.expires_at,
    resendAvailableAt: raw.resend_available_at,
    attemptsLeft: raw.attempts_left,
  };
}

export function mapAuthOptions(raw: RawAuthOptions): AuthOptions {
  return { otpChannels: raw.otp_channels, socialProviders: raw.social_providers, termsVersion: raw.terms_version };
}

/** بريد لو فيه @، وإلا موبايل — زي اللي Laravel بيتوقعه في login/forgot */
export function identifierField(identifier: string): { email: string } | { phone: string } {
  const value = identifier.trim();
  return value.includes("@") ? { email: value.toLowerCase() } : { phone: value };
}
