// أفعال المصادقة على السيرفر — الواجهة جاهزة، التنفيذ لسه
"use server";

import type { AuthSession, ForgotPasswordDto, LoginDto, RegisterDto, VerifyOtpDto } from "@/lib/types/auth";

const NOT_IMPLEMENTED = "المصادقة مش متاحة لسه";

export async function login(_dto: LoginDto): Promise<AuthSession> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function register(_dto: RegisterDto): Promise<{ phone: string }> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function verifyOtp(_dto: VerifyOtpDto): Promise<AuthSession> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function forgotPassword(_dto: ForgotPasswordDto): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function refreshSession(): Promise<AuthSession> {
  throw new Error(NOT_IMPLEMENTED);
}

export async function logout(): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}
