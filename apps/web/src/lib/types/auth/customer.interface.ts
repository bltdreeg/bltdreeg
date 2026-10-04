// العميل زي ما بيرجع من Laravel (بعد التحويل لـ camelCase) — مفيش توكن هنا أبداً
export type OnboardingStep = "phone" | "name" | "terms" | "location" | "birth_date";

export interface CustomerOnboarding {
  complete: boolean;
  missing: OnboardingStep[];
  skippable: OnboardingStep[];
}

export interface CustomerLocation {
  lat: number;
  lng: number;
  source: "gps" | "ip";
  updatedAt: string | null;
}

export interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  /** بصيغة 01XXXXXXXXX؛ null للحساب الاجتماعي الناقص */
  phone: string | null;
  phoneVerified: boolean;
  email: string | null;
  emailVerified: boolean;
  pendingEmail: string | null;
  birthDate: string | null;
  hasPassword: boolean;
  socialProviders: string[];
  location: CustomerLocation | null;
  onboarding: CustomerOnboarding;
}
