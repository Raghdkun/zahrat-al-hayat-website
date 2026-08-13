import Link from "next/link";

/**
 * Root fallback for non-localized unmatched routes (rendered without the
 * [locale] layout, so it is a self-contained document with inline styles).
 * Localized 404s are handled by app/[locale]/not-found.tsx.
 */
export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fcfaf7",
          color: "#0d0503",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <div style={{ fontSize: 72, fontWeight: 600, color: "#4e0078", lineHeight: 1 }}>٤٠٤</div>
          <h1 style={{ fontSize: 26, margin: 0, fontWeight: 600 }}>الصفحة غير موجودة</h1>
          <p style={{ color: "#8d6959", margin: 0 }}>
            عذراً، الصفحة التي تبحث عنها غير متوفرة.
          </p>
          <Link
            href="/ar"
            style={{
              marginTop: 8,
              display: "inline-block",
              backgroundColor: "#4e0078",
              color: "#ffffff",
              textDecoration: "none",
              padding: "12px 26px",
              borderRadius: 9999,
              fontWeight: 600,
            }}
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </body>
    </html>
  );
}
