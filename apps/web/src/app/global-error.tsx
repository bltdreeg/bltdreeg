// خطأ عام على مستوى التطبيق — لازم يرسم html/body بنفسه
"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <section role="alert" style={{ textAlign: "center" }}>
          <h1>حصلت مشكلة</h1>
          <p>مش قادرين نحمّل التطبيق دلوقتي.</p>
          <button type="button" onClick={reset}>
            إعادة المحاولة
          </button>
        </section>
      </body>
    </html>
  );
}
