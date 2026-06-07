"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useReveal } from "@/hooks/use-reveal";

const items = [
  { valueKey: "years_value", labelKey: "years_label" },
  { valueKey: "students_value", labelKey: "students_label" },
  { valueKey: "sessions_value", labelKey: "sessions_label" },
];

function StatNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = value;
      return;
    }
    const match = value.match(/^(\d+)(.*)$/);
    if (!match) {
      node.textContent = value;
      return;
    }
    const target = parseInt(match[1], 10);
    const suffix = match[2] ?? "";
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: node, start: "top 85%", toggleActions: "play none none none" },
      onUpdate: () => {
        node.textContent = `${Math.round(obj.v)}${suffix}`;
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value]);
  return <span ref={ref}>0</span>;
}

export default function Stats() {
  const t = useTranslations("stats");
  const headRef = useReveal<HTMLDivElement>({ stagger: 0.1 });
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.15, distance: 40 });

  return (
    <section className="section-y section-x bg-background border-y border-border/60">
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="max-w-2xl mx-auto text-center flex flex-col gap-3 mb-12">
          <span className="eyebrow mx-auto">{t("label")}</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground leading-[1.1]">
            {t("title")}
          </h2>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {items.map((it) => (
            <div key={it.valueKey} className="flex flex-col items-center text-center gap-2">
              <span className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium text-primary leading-none">
                <StatNumber value={t(it.valueKey)} />
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">{t(it.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
