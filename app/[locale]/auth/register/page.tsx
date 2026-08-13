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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const t = useTranslations("auth");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("register_failed"));
      }
      toast.success(t("register_success"));
      // Auto sign-in with the just-created credentials.
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        // Account created but auto-login failed — send them to login.
        router.push(`/${locale}/auth/login`);
      } else {
        router.push(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : `/${locale}/book`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("register_failed"));
    } finally {
      setLoading(false);
    }
  };

  const loginHref = callbackUrl
    ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/auth/login";

  return (
    <div className="paper-grain relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary/40 px-4 py-16">
      <Botanical variant="bloom" className="pointer-events-none absolute -top-8 -start-10 h-72 w-72 text-primary/[0.06]" />
      <Botanical variant="sprig" className="pointer-events-none absolute -bottom-10 -end-8 h-64 w-64 rotate-12 text-secondary/40" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5 sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <span className="font-display text-xl font-medium text-primary-foreground">زه</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-foreground">{t("register")}</h1>
          <p className="text-sm text-muted-foreground">{t("register_subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder={t("name_placeholder")}
              className="h-11 rounded-xl"
            />
          </div>
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
              dir="ltr"
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
              minLength={8}
              placeholder="••••••••"
              className="h-11 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">{t("password_hint")}</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-pill btn-pill-primary mt-2 w-full justify-center disabled:opacity-60"
          >
            {loading ? (
              <>
                <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                {t("creating")}
              </>
            ) : (
              <>
                {t("register")}
                <Arrow size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("have_account")}{" "}
          <Link href={loginHref} className="font-medium text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
