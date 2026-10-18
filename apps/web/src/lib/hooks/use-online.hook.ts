"use client";

// حالة الاتصال من navigator.onLine — useSyncExternalStore بدل قراءتها في effect
import { useCallback, useState, useSyncExternalStore } from "react";

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

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

const getSnapshot = () => navigator.onLine;
// السيرفر بيفترض إن فيه اتصال عشان البانر ميظهرش في الـ HTML
const getServerSnapshot = () => true;

export function useOnline(initialLastTime = ""): UseOnlineReturn {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // آخر وقت كان فيه اتصال = لحظة ما الاتصال وقع. بيتحدّث في الريندر لما الحالة تتغير
  // (نمط "تخزين القيمة السابقة" من React docs) بدل effect
  const [lastOnlineTime, setLastOnlineTime] = useState(initialLastTime);
  const [wasOnline, setWasOnline] = useState(isOnline);
  if (wasOnline !== isOnline) {
    setWasOnline(isOnline);
    if (!isOnline) setLastOnlineTime(getFormattedTime());
  }

  const checkOnline = useCallback(() => {
    if (navigator.onLine) setLastOnlineTime(getFormattedTime());
  }, []);

  return { isOnline, lastOnlineTime, checkOnline };
}
