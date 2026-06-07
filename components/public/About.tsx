"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sparkle, Leaf, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { useReveal } from "@/hooks/use-reveal";

export default function About() {
  const t = useTranslations("about");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const imageRef = useReveal<HTMLDivElement>({ direction: "left", distance: 80 });
  const textRef = useReveal<HTMLDivElement>({ direction: "right", stagger: 0.1 });

  return (
    <section id="about" className="section-y section-x bg-secondary/40">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image side */}
        <div ref={imageRef}>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[36px] bg-gradient-to-br from-accent/60 via-secondary to-primary/10 blur-2xl" />
            <div className="relative soft-frame aspect-4/5 max-w-md mx-auto lg:mx-0">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYrVvfl1JDA_se8NWVejsUlwyw9Be1TPfx8k3v8d-sWzXgo2kxArsYIAAT5h0BdM8D9SFcDM94VnGZej75DEEUdINwwXSmtvs0b-pAK4bin9uYugFfzZzRljcQgVJvvWevXfQGnm-IidRPj6gXQh0NF8MEuS1sy_hL9f7EKrUc0i2Zpu1PHEj5xxIJIhi0SVOyYuI7QaXS9wv5mqh0MfjJAQ5KDKtlVb5zsZQpDUiNQVGcaX03Gol390oIF4NPW_H8dvVk6Uo8Jrk"
                alt={t("title")}
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover"
              />
              {/* Floating chip */}
              <div className="absolute top-5 start-5 rounded-full bg-background/90 backdrop-blur px-3 py-1.5 text-xs font-medium border border-border shadow">
                {t("label")}
              </div>
            </div>
          </div>
        </div>

        {/* Text side */}
        <div ref={textRef} className="flex flex-col gap-6">
          <span className="eyebrow">{t("label")}</span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-[1.05]">
            {t("title")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
            {t("description")}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <div className="rounded-2xl border border-border bg-background/70 backdrop-blur p-5 shadow-sm transition-shadow hover:shadow-md">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-3">
                <Sparkle size={20} weight="duotone" className="text-primary" />
              </span>
              <h4 className="font-semibold text-base text-foreground mb-1">
                {t("self_awareness_title")}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("self_awareness_desc")}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 backdrop-blur p-5 shadow-sm transition-shadow hover:shadow-md">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-3">
                <Leaf size={20} weight="duotone" className="text-primary" />
              </span>
              <h4 className="font-semibold text-base text-foreground mb-1">
                {t("energy_healing_title")}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("energy_healing_desc")}
              </p>
            </div>
          </div>

          <Link href="/book" className="btn-pill btn-pill-primary self-start mt-2">
            {tn("book")}
            <Arrow size={16} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}
