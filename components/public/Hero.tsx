"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ArrowDown, Star, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
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
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.6 })
        .from(".hero-title > span", { y: 60, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.35")
        .from(".hero-desc", { y: 24, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(".hero-ctas > *", { y: 20, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.4")
        .from(".hero-trust", { y: 16, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(
          ".hero-image",
          {
            xPercent: isRtl ? -10 : 10,
            opacity: 0,
            scale: 0.96,
            duration: 1.1,
            ease: "power3.out",
          },
          0.25
        );

      // Subtle parallax of hero image while scrolling within first viewport
      gsap.to(".hero-image", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isRtl]);

  const ChevDown = ArrowDown;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const titleParts = t("title").split(" ");

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="relative bg-background pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="lg:col-span-6 flex flex-col gap-6 lg:gap-7">
            <span className="hero-eyebrow eyebrow inline-flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              {t("subtitle")}
            </span>

            <h1 className="hero-title font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-foreground leading-[1.05] tracking-tight">
              {titleParts.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden align-bottom">
                  <span className="inline-block">
                    {word}
                    {i < titleParts.length - 1 ? "\u00A0" : ""}
                  </span>
                </span>
              ))}
            </h1>

            <p className="hero-desc max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed">
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

            {/* Trust badge: avatars + rating */}
            <div className="hero-trust flex items-center gap-4 pt-3">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full ring-2 ring-background bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center text-[10px] font-semibold text-primary"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} weight="fill" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {t("trust_note")} · {t("trust_rating")}
                </span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="lg:col-span-6">
            <div className="hero-image relative">
              {/* Soft blob behind image */}
              <div className="absolute -inset-6 -z-10 rounded-[42%] bg-gradient-to-br from-primary/10 via-accent/40 to-secondary blur-3xl" />
              <div className="relative soft-frame aspect-4/5 lg:aspect-3/4">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={t("title")}
                    fill
                    sizes="(min-width: 1024px) 600px, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary-foreground to-secondary flex items-center justify-center">
                    <span className="font-display text-7xl text-white/90">زه</span>
                  </div>
                )}
                {/* Floating mini-card */}
                <div className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:max-w-xs rounded-2xl bg-background/90 backdrop-blur-md p-4 shadow-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star size={18} weight="fill" className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {t("trust_rating")}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {t("trust_note")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground/70 animate-bounce">
        <span className="text-[10px] tracking-widest uppercase">scroll</span>
        <ChevDown size={16} weight="bold" />
      </div>
    </section>
  );
}

