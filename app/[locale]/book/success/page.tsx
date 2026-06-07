"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckCircle } from "@phosphor-icons/react";

export default function BookingSuccessPage() {
  const t = useTranslations("booking_status");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-11 h-11 text-emerald-600" weight="fill" />
        </div>
        <h1 className="font-display text-4xl font-medium text-foreground">{t("success_title")}</h1>
        <p className="text-muted-foreground text-base leading-relaxed">{t("success_desc")}</p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link href="/" className="btn-pill btn-pill-primary">
            {t("go_home")}
          </Link>
          <Link href="/book" className="btn-pill btn-pill-ghost">
            {t("book_another")}
          </Link>
        </div>
      </div>
    </div>
  );
}
