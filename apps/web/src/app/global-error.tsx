// خطأ عام على مستوى التطبيق — لازم يرسم html/body بنفسه.
// بيتعرض بره NextIntlClientProvider، فالرسالة باللغتين بدل الترجمة
"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <section role="alert" style={{ textAlign: "center" }}>
          <h1>حصلت مشكلة</h1>
          <p>مش قادرين نحمّل التطبيق دلوقتي.</p>
          <p lang="en" dir="ltr" style={{ color: "#6B7280" }}>
            Something went wrong. We couldn&apos;t load the app right now.
          </p>
          <button type="button" onClick={reset}>
            إعادة المحاولة · Try again
          </button>
        </section>
      </body>
    </html>
  );
}
