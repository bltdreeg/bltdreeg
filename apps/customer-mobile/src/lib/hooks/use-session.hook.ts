// حالة الجلسة المحلية (فيه توكن ولا لأ) — بتتحدث فوراً بعد login/logout من غير API call
import { useSyncExternalStore } from "react";
import { tokenStorage } from "@/lib/utils/auth/token-storage";

const hasSession = () => tokenStorage.getAccessToken() !== null;

export function useSession() {
  return {
    hasSession: useSyncExternalStore(tokenStorage.subscribe, hasSession),
    needsOnboarding: useSyncExternalStore(tokenStorage.subscribe, tokenStorage.needsOnboarding),
  };
}
