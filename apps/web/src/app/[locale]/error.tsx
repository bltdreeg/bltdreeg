// صفحة خطأ داخل اللغة مع زرار إعادة المحاولة
"use client";

import { Button } from "@/components/atoms/button";

export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section role="alert" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">حصلت مشكلة</h1>
      <p className="text-muted-foreground">مش قادرين نحمّل الصفحة دلوقتي. جرّب تاني.</p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </section>
  );
}
