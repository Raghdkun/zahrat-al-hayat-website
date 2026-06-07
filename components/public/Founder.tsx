"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Medal, Certificate, Buildings, Megaphone, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useReveal } from "@/hooks/use-reveal";

const credentials: { icon: Icon; key: string }[] = [
  { icon: Medal, key: "credential_1" },
  { icon: Certificate, key: "credential_2" },
  { icon: Buildings, key: "credential_3" },
  { icon: Megaphone, key: "credential_4" },
];

export default function Founder() {
  const t = useTranslations("founder");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const imgRef = useReveal<HTMLDivElement>({ direction: "right" });
  const txtRef = useReveal<HTMLDivElement>({ direction: "left", stagger: 0.1 });

  return (
    <section id="founder" className="section-y section-x bg-secondary/40">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Text */}
        <div ref={txtRef} className="lg:col-span-6 order-2 lg:order-1 flex flex-col gap-5">
          <span className="eyebrow">{t("label")}</span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-[1.05]">
            {t("title")}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4 mt-3">
            {credentials.map(({ icon: Icon, key }) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-2xl border border-border bg-background/70 backdrop-blur p-4"
              >
                <span className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
                  <Icon size={18} weight="duotone" />
                </span>
                <p className="text-sm text-foreground/85 leading-relaxed">{t(key)}</p>
              </li>
            ))}
          </ul>
          <Link href="/book" className="btn-pill btn-pill-primary self-start mt-3">
            {t("cta")}
            <Arrow size={16} weight="bold" />
          </Link>
        </div>

        {/* Image */}
        <div ref={imgRef} className="lg:col-span-6 order-1 lg:order-2">
          <div className="relative max-w-md mx-auto lg:mx-0 lg:ms-auto">
            <div className="absolute -inset-5 -z-10 rounded-[40%] bg-gradient-to-br from-primary/15 via-accent/40 to-secondary blur-2xl" />
            <div className="relative soft-frame aspect-3/4">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnvVoVDeDRT65_QIqpcYezrJqZvMKTfwiG9ifDwbDT2s7_fGQl-H3bGa0_oNUNPZXfschHzW0iFVLGo_IGYPL6yT-EuUitqnkG55zHrdXDNAyLaGPXkMNKU38yeKMO2ZKTDgHkBjQKCJOiFhOdhjDG5HCmqDhPKUUs2u878dq4RMwFE3BAYKSZGpIz2WR0ZtVSfG5n-RjUaxG0ncl0_l4rS4No5fdi7W1TIkjtzwyrSG95lzCZccTQPQo9LPu6-Ck4cpJwpnjm0aY"
                alt={t("title")}
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
