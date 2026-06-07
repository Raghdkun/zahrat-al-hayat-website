"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { XCircle } from "@phosphor-icons/react";

export default function BookingCancelPage() {
  const t = useTranslations("booking_status");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
          <XCircle className="w-11 h-11 text-rose-500" weight="fill" />
        </div>
        <h1 className="font-display text-4xl font-medium text-foreground">{t("cancel_title")}</h1>
        <p className="text-muted-foreground text-base leading-relaxed">{t("cancel_desc")}</p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link href="/book" className="btn-pill btn-pill-primary">
            {t("try_again")}
          </Link>
          <Link href="/" className="btn-pill btn-pill-ghost">
            {t("go_home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
