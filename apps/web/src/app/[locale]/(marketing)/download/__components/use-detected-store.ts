"use client";

// كشف جهاز الزائر — useSyncExternalStore عشان السيرفر يرندر الافتراضي والمتصفح يصحّحه من غير cascading render.

import { useSyncExternalStore } from "react";
import type { Store } from "./store-assets";

/** الـuserAgent ما بيتغيرش، فمفيش اشتراك — الـsnapshot بيتقرا مرة واحدة */
const noopSubscribe = () => () => {};

function readStore(): Store | null {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return null;
}

/** null على السيرفر وعلى أي جهاز مش موبايل — وقتها الصفحة بترجع لترتيبها الافتراضي */
function useDetectedStore(): Store | null {
  return useSyncExternalStore(noopSubscribe, readStore, () => null);
}

export { useDetectedStore };
