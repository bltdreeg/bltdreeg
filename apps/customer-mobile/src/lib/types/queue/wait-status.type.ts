// حالة الانتظار — نظام دلالي واحد للبادجات والـ pins والكروت في كل الشاشات
// free/short → أخضر · mid → أصفر · busy → أحمر · closed/stale → رمادي
export type WaitStatus = "free" | "short" | "mid" | "busy" | "closed" | "stale";
