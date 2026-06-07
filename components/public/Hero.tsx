"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ArrowDown, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import Botanical from "@/components/public/Botanical";
import gsap from "gsap";

export default function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { logoUrl } = useSiteSettings();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1, defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { y: 18, opacity: 0, duration: 0.6 })
        .from(".hero-title > span", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.09 }, "-=0.3")
        .from(".hero-desc", { y: 22, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(".hero-ctas > *", { y: 18, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.4")
        .from(".hero-meta", { y: 14, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(".hero-visual", { opacity: 0, scale: 0.94, duration: 1.1, ease: "power3.out" }, 0.2);
    }, sectionRef);

    return () => ctx.revert();
  }, [isRtl]);

  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  // Split the title so the final word can take an italic editorial accent.
  const words = t("title").split(" ");
  const lead = words.slice(0, -1).join(" ");
  const accent = words[words.length - 1];

  const meta = isRtl
    ? ["التنمية البشرية والوعي الذاتي", "السويداء، سوريا", "بإشراف د. ريم الحايك"]
    : ["Human development & self-awareness", "Sweida, Syria", "Led by Dr. Reem Al Hayek"];

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="paper-grain relative overflow-hidden bg-background pt-28 pb-20 lg:pt-36 lg:pb-28"
    >
      {/* Ambient botanical signature (decorative) */}
      <Botanical
        variant="bloom"
        className="animate-botanical pointer-events-none absolute -top-6 end-[-40px] h-64 w-64 text-primary/[0.07] sm:h-80 sm:w-80"
      />
      <Botanical
        variant="sprig"
        className="pointer-events-none absolute bottom-10 start-[-30px] h-52 w-52 text-secondary/[0.10] rotate-12"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Text */}
          <div className="flex flex-col gap-6 lg:col-span-7 lg:gap-7">
            <span className="hero-eyebrow eyebrow inline-flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary" />
              {t("subtitle")}
            </span>

            <h1 className="hero-title font-display text-5xl font-medium leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <span className="inline-block overflow-hidden align-bottom">
                <span className="inline-block">{lead}&nbsp;</span>
              </span>
              <span className="inline-block overflow-hidden align-bottom">
                <span className="display-italic inline-block text-primary">{accent}</span>
              </span>
            </h1>

            <p className="hero-desc max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("description")}
            </p>

            <div className="hero-ctas flex flex-wrap items-center gap-3 pt-1">
              <Link href="/book" className="btn-pill btn-pill-primary">
                {t("cta_primary")}
                <Arrow size={18} weight="bold" />
              </Link>
              <a href="#about" className="btn-pill btn-pill-ghost">
                {t("cta_secondary")}
              </a>
            </div>

            {/* Genuine credibility row (no fabricated metrics) */}
            <ul className="hero-meta flex flex-wrap items-center gap-x-3 gap-y-2 pt-4 text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
              {meta.map((item, i) => (
                <li key={item} className="inline-flex items-center gap-3">
                  {i > 0 && <span className="h-1 w-1 rounded-full bg-border" />}
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual — editorial emblem panel (no stock photo, no fake proof) */}
          <div className="lg:col-span-5">
            <div className="hero-visual relative mx-auto max-w-md">
              <div className="organic-frame relative aspect-4/5 bg-gradient-to-br from-accent to-secondary-fixed shadow-[0_40px_80px_-40px_rgba(78,0,120,0.45)]">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={t("title")}
                    fill
                    sizes="(min-width: 1024px) 460px, 80vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-primary">
                    <Botanical variant="stem" className="h-28 w-28 text-primary/70" strokeWidth={1.5} />
                    <span className="font-display text-6xl font-medium">زه</span>
                  </div>
                )}
              </div>

              {/* Single small, real signature chip */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-card/95 px-5 py-2.5 shadow-xl backdrop-blur-sm">
                <span className="font-display text-base font-medium text-foreground">
                  {isRtl ? "رحلتك نحو السكينة تبدأ هنا" : "Your journey to calm begins here"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue (gentle drift, not bounce) */}
      <div className="animate-scroll-hint absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/60">
        <ArrowDown size={18} weight="bold" />
      </div>
    </section>
  );
}
