"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Envelope, WhatsappLogo, CalendarCheck, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { useReveal } from "@/hooks/use-reveal";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { whatsappUrl } from "@/lib/whatsapp";
import Botanical from "@/components/public/Botanical";

export default function CTASection() {
  const t = useTranslations("cta");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const ref = useReveal<HTMLDivElement>({ stagger: 0.12 });
  const { whatsappNumber } = useSiteSettings();
  const waUrl = whatsappUrl(
    whatsappNumber,
    isRtl ? "مرحباً، أرغب بالتواصل مع مركز زهرة الحياة" : "Hello, I'd like to contact Zahrat Al Hayat"
  );

  return (
    <section id="cta" className="section-y section-x bg-background">
      <div className="mx-auto max-w-6xl">
        <div
          ref={ref}
          className="relative rounded-[32px] sm:rounded-[42px] overflow-hidden p-8 sm:p-14 lg:p-20 text-center"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(244,217,255,0.45), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,177,197,0.35), transparent 55%), linear-gradient(135deg, #4e0078 0%, #6a1b9a 55%, #ab2c5d 100%)",
          }}
        >
          <div className="absolute inset-0 -z-0 opacity-30 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_50%,white,transparent_70%)]" />
          <Botanical variant="bloom" className="pointer-events-none absolute -top-8 end-6 h-40 w-40 text-white/10" />
          <Botanical variant="sprig" className="pointer-events-none absolute -bottom-6 start-8 h-32 w-32 text-white/10" />
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto text-white">
            <span className="eyebrow text-white/70 !text-white/70">{t("title")}</span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.05]">
              {t("title")}
            </h2>
            <p className="text-base sm:text-lg text-white/85 max-w-xl">
              {t("description")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link href="/book" className="btn-pill bg-white text-primary hover:bg-white/90">
                <CalendarCheck size={18} weight="bold" />
                {t("book_cta")}
                <Arrow size={16} weight="bold" />
              </Link>
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill bg-white/10 text-white border border-white/30 hover:bg-white/20"
                >
                  <WhatsappLogo size={18} weight="fill" />
                  {t("contact_cta")}
                </a>
              ) : (
                <a
                  href="mailto:contact@zahrat-alhayat.com"
                  className="btn-pill bg-white/10 text-white border border-white/30 hover:bg-white/20"
                >
                  <Envelope size={18} weight="bold" />
                  {t("contact_cta")}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
