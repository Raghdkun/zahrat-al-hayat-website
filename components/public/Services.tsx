"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GraduationCap, Brain, UsersThree, FlowerLotus, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useReveal } from "@/hooks/use-reveal";
import Botanical from "@/components/public/Botanical";

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
  const listRef = useReveal<HTMLDivElement>({ stagger: 0.1, distance: 40 });

  return (
    <section id="services" className="section-y section-x relative overflow-hidden bg-background">
      <Botanical
        variant="stem"
        className="pointer-events-none absolute top-16 end-[-50px] h-72 w-72 text-primary/[0.05]"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div ref={headRef} className="mb-14 flex max-w-2xl flex-col gap-4 lg:mb-20">
          <span className="eyebrow">{t("label")}</span>
          <h2 className="font-display text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="max-w-lg text-base text-muted-foreground sm:text-lg">{t("subtitle")}</p>
        </div>

        {/* Editorial numbered list (not a card grid) */}
        <div ref={listRef} className="flex flex-col">
          <div className="hairline" />
          {services.map((service, i) => {
            const IconComponent = service.icon;
            return (
              <div key={service.titleKey}>
                <article className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 py-8 sm:grid-cols-[5rem_1fr_auto] sm:gap-x-10 sm:py-10">
                  <span className="font-display text-3xl font-medium text-primary/35 tabular-nums transition-colors duration-500 group-hover:text-primary sm:text-5xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-2xl font-medium leading-snug text-foreground transition-colors duration-500 group-hover:text-primary sm:text-3xl">
                      {t(service.titleKey)}
                    </h3>
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {t(service.descKey)}
                    </p>
                  </div>
                  <div className="col-start-2 row-start-1 justify-self-end text-muted-foreground/50 transition-colors duration-500 group-hover:text-secondary sm:col-start-3 sm:row-start-auto sm:self-center">
                    <IconComponent size={30} weight="duotone" />
                  </div>
                </article>
                <div className="hairline" />
              </div>
            );
          })}
        </div>

        <div className="mt-12">
          <Link href="/book" className="btn-pill btn-pill-primary inline-flex">
            {t("view_all")}
            <Arrow size={16} weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}
