"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CircleNotch, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import Botanical from "@/components/public/Botanical";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const t = useTranslations("auth");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(t("invalid_credentials"));
      } else {
        router.push(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : `/${locale}/dashboard`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paper-grain min-h-screen flex items-center justify-center bg-secondary/40 px-4 py-16 relative overflow-hidden">
      <Botanical variant="bloom" className="pointer-events-none absolute -top-8 -start-10 h-72 w-72 text-primary/[0.06]" />
      <Botanical variant="sprig" className="pointer-events-none absolute -bottom-10 -end-8 h-64 w-64 text-secondary/40 rotate-12" />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-card border border-border shadow-xl shadow-primary/5 p-8 sm:p-10">
        <div className="text-center flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display text-xl font-medium">زه</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-foreground">{t("login")}</h1>
          <p className="text-sm text-muted-foreground">{t("login_subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder={t("email_placeholder")}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="••••••••"
              className="h-11 rounded-xl"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-pill btn-pill-primary w-full justify-center mt-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                {t("signing_in")}
              </>
            ) : (
              <>
                {t("submit")}
                <Arrow size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Arrow size={14} weight="bold" className="rotate-180" />
            {isRtl ? "العودة إلى الرئيسية" : "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
