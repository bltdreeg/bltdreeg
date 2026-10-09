// منطق القرار بتاع إذن موقع الزائر (من غير DOM) — بيتختبر بـ node --test؛ useVisitorPosition بيستخدمه
export type VisitorPermission = PermissionState | "unsupported" | null;

/**
 * القائمة ممكن تتجاب (من الـ IP أو من الموقع):
 * - permission لسه بيتفحص (null) → استنى
 * - granted وبرضو الموقع لسه جاري → استنى الإحداثيات بدل ما نجيب قائمة IP وبعدها بثانية قائمة GPS
 * - أي حالة تانية (prompt/denied/unsupported، أو granted وخلص الطلب) → جاهزة
 */
export function visitorListSettled(permission: VisitorPermission, positionPending: boolean): boolean {
  return permission !== null && !(permission === "granted" && positionPending);
}

/** سمح من إعدادات المتصفح بعد ما طلب سابق فشل (رفض الـ prompt مثلًا) — نعيد المحاولة */
export function shouldRefetchPosition(permission: VisitorPermission, positionFailed: boolean): boolean {
  return permission === "granted" && positionFailed;
}
