// تحويل استجابات Laravel (snake_case) لأنواع الويب (camelCase)
import type { AuthOptions, Customer, OtpChallenge } from "../../types/auth/index.ts";
import type { LocationSource, ResolvedLocation } from "../../types/geo/geo.interface.ts";

export interface RawNamedRef {
  id: string;
  name: string;
}

export interface RawGeoDivision {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RawResolvedLocation {
  governorate: RawNamedRef;
  city: RawNamedRef;
  area: RawNamedRef;
  lat: number;
  lng: number;
  source: LocationSource;
}

export interface RawCustomer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  email: string | null;
  email_verified: boolean;
  birth_date: string | null;
  has_password: boolean;
  social_providers: string[];
  location: RawResolvedLocation & { updated_at: string | null; confirmed: boolean };
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
    birthDate: raw.birth_date,
    hasPassword: raw.has_password,
    socialProviders: raw.social_providers,
    location: {
      lat: raw.location.lat,
      lng: raw.location.lng,
      source: raw.location.source,
      updatedAt: raw.location.updated_at,
      confirmed: raw.location.confirmed,
      governorate: raw.location.governorate,
      city: raw.location.city,
      area: raw.location.area,
    },
    onboarding: raw.onboarding,
  };
}

export function mapResolvedLocation(raw: RawResolvedLocation): ResolvedLocation {
  return { governorate: raw.governorate, city: raw.city, area: raw.area, lat: raw.lat, lng: raw.lng, source: raw.source };
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
