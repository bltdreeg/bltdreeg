"use client";

// خطاف إدارة حالة المستخدم والمصادقة للعميل
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "@/i18n/navigation";
import { GUEST_COOKIE, SESSION_COOKIE } from "@/lib/data/constants/app.constants";
import { currentUser } from "@/lib/data/user.constants";
import type { User } from "@/lib/types/user/user.interface";

export interface UseUserReturn {
  user: User | null;
  isAuthenticated: boolean;
  /** اختار "تصفح كزائر" — تفضيل متذكر، مش صلاحية؛ المسارات المحمية لسه بتحوّله لتسجيل الدخول */
  isGuest: boolean;
  isLoading: boolean;
  refresh: () => void;
}

function hasCookie(name: string): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${name}=`));
}

export function useUser(): UseUserReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // الهيدر بيفضل مركّب بين الصفحات، فبنعيد قراءة الكوكي مع كل تنقل
  // عشان يتحدّث فوراً بعد تسجيل الدخول أو الخروج.
  const pathname = usePathname();

  const checkAuth = useCallback(() => {
    if (typeof document === "undefined") {
      setIsLoading(false);
      return;
    }
    setIsAuthenticated(hasCookie(SESSION_COOKIE));
    setIsGuest(hasCookie(GUEST_COOKIE));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("focus", checkAuth);
    return () => window.removeEventListener("focus", checkAuth);
  }, [checkAuth, pathname]);

  return {
    user: isAuthenticated ? currentUser : null,
    isAuthenticated,
    isGuest,
    isLoading,
    refresh: checkAuth,
  };
}
