"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { WarningCircle, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import Botanical from "@/components/public/Botanical";

/** Auth.js error codes -> friendly, localized copy. */
function describe(code: string | null, isRtl: boolean) {
  switch (code) {
    case "CredentialsSignin":
      return isRtl
        ? "بيانات الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور."
        : "Invalid email or password. Please check your details and try again.";
    case "AccessDenied":
      return isRtl
        ? "ليس لديك صلاحية الوصول إلى هذه الصفحة."
        : "You don't have permission to access this page.";
    case "Verification":
      return isRtl
        ? "انتهت صلاحية رابط التحقق أو تم استخدامه من قبل."
        : "That verification link has expired or was already used.";
    case "Configuration":
      return isRtl
        ? "هناك مشكلة في إعدادات الخادم. يرجى المحاولة لاحقاً أو التواصل معنا."
        : "There's a problem with the server configuration. Please try again later or contact us.";
    default:
      return isRtl
        ? "حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى."
        : "Something went wrong while signing in. Please try again.";
  }
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("error");
  const t = useTranslations("auth");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="paper-grain relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary/40 px-4 py-16">
      <Botanical variant="bloom" className="pointer-events-none absolute -top-8 -start-10 h-72 w-72 text-primary/[0.06]" />
      <Botanical variant="sprig" className="pointer-events-none absolute -bottom-10 -end-8 h-64 w-64 rotate-12 text-secondary/40" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl shadow-primary/5 sm:p-10">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <WarningCircle size={28} weight="duotone" />
          </div>
          <h1 className="font-display text-3xl font-medium text-foreground">
            {isRtl ? "تعذّر تسجيل الدخول" : "Sign-in failed"}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{describe(code, isRtl)}</p>
          {code && (
            <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[11px] text-muted-foreground">
              {code}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/auth/login" className="btn-pill btn-pill-primary w-full justify-center">
            {t("login")}
            <Arrow size={16} weight="bold" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Arrow size={14} weight="bold" className="rotate-180" />
            {isRtl ? "العودة إلى الرئيسية" : "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorContent />
    </Suspense>
  );
}
