"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Medal, Certificate, Buildings, Megaphone, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useReveal } from "@/hooks/use-reveal";
import Botanical from "@/components/public/Botanical";

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
    <section id="founder" className="section-y section-x relative overflow-hidden bg-secondary/40">
      <Botanical
        variant="bloom"
        className="pointer-events-none absolute -bottom-10 end-[-30px] h-64 w-64 text-primary/[0.06]"
      />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Text */}
        <div ref={txtRef} className="order-2 flex flex-col gap-5 lg:order-1 lg:col-span-6">
          <span className="eyebrow">{t("label")}</span>
          <h2 className="font-display text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            {t("title")}
          </h2>

          {/* Credentials as a clean editorial list (no boxed cards) */}
          <ul className="mt-3 flex flex-col">
            {credentials.map(({ icon: Icon, key }, i) => (
              <li
                key={key}
                className={`flex items-start gap-4 py-4 ${i > 0 ? "border-t border-border/60" : ""}`}
              >
                <span className="mt-0.5 shrink-0 text-primary">
                  <Icon size={22} weight="duotone" />
                </span>
                <p className="text-base leading-relaxed text-foreground/85">{t(key)}</p>
              </li>
            ))}
          </ul>

          <Link href="/book" className="btn-pill btn-pill-primary mt-3 self-start">
            {t("cta")}
            <Arrow size={16} weight="bold" />
          </Link>
        </div>

        {/* Image */}
        <div ref={imgRef} className="order-1 lg:order-2 lg:col-span-6">
          <div className="relative mx-auto max-w-md lg:mx-0 lg:ms-auto">
            <Botanical
              variant="sprig"
              className="pointer-events-none absolute -top-8 start-[-24px] h-28 w-28 text-secondary/30"
            />
            <div className="soft-frame relative aspect-3/4">
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
