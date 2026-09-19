"use client";

import { useEffect, useState, useTransition } from "react";

export interface UseOnlineReturn {
  isOnline: boolean;
  lastOnlineTime: string;
  checkOnline: () => void;
}

function getFormattedTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "م" : "ص";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

export function useOnline(initialLastTime = "9:32 م"): UseOnlineReturn {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastOnlineTime, setLastOnlineTime] = useState<string>(initialLastTime);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Check initial online status in browser
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setLastOnlineTime(getFormattedTime());
      }
    }

    const handleOnline = () => {
      startTransition(() => {
        setIsOnline(true);
        setLastOnlineTime(getFormattedTime());
      });
    };

    const handleOffline = () => {
      startTransition(() => {
        setIsOnline(false);
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkOnline = () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const current = navigator.onLine;
      setIsOnline(current);
      if (current) {
        setLastOnlineTime(getFormattedTime());
      }
    }
  };

  return {
    isOnline,
    lastOnlineTime,
    checkOnline,
  };
}
