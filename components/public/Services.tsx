"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GraduationCap, Brain, UsersThree, FlowerLotus, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useReveal } from "@/hooks/use-reveal";

const services: { icon: Icon; titleKey: string; descKey: string }[] = [
  { icon: GraduationCap, titleKey: "training_title", descKey: "training_desc" },
  { icon: Brain, titleKey: "workshops_title", descKey: "workshops_desc" },
  { icon: UsersThree, titleKey: "sessions_title", descKey: "sessions_desc" },
  { icon: FlowerLotus, titleKey: "yoga_title", descKey: "yoga_desc" },
];

export default function Services() {
  const t = useTranslations("services");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const headRef = useReveal<HTMLDivElement>({ stagger: 0.1 });
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.12, distance: 50 });

  return (
    <section id="services" className="section-y section-x bg-background">
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="max-w-2xl flex flex-col gap-4 mb-12 lg:mb-16">
          <span className="eyebrow">{t("label")}</span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-[1.05]">
            {t("title")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-lg">
            {t("subtitle")}
          </p>
          <div className="pt-2">
            <Link href="/book" className="btn-pill btn-pill-primary inline-flex">
              {t("view_all")}
              <Arrow size={16} weight="bold" />
            </Link>
          </div>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {services.map((service, i) => {
            const IconComponent = service.icon;
            return (
              <article
                key={service.titleKey}
                className="group relative rounded-3xl border border-border bg-card p-6 sm:p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30"
              >
                <div className="flex items-start gap-5">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <IconComponent size={26} weight="duotone" />
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    <h3 className="font-display text-2xl font-medium text-foreground leading-snug">
                      {t(service.titleKey)}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {t(service.descKey)}
                    </p>
                  </div>
                </div>
                <span className="absolute top-6 end-6 text-xs font-mono text-muted-foreground/60">
                  0{i + 1}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
