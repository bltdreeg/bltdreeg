// طلب إذن الموقع من المتصفح — مرة واحدة، مع timeout
export type BrowserPosition = { lat: number; lng: number } | { error: "denied" | "unavailable" };

export function requestBrowserPosition(timeoutMs = 10000): Promise<BrowserPosition> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ error: "unavailable" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (failure) => resolve({ error: failure.code === failure.PERMISSION_DENIED ? "denied" : "unavailable" }),
      // high accuracy بيعمل timeout على اللابتوب (مفيش GPS chip) فكان بيرجّع لتقدير الـ IP بصمت — مدينة/منطقة مش محتاجة دقة GPS
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60000 },
    );
  });
}
