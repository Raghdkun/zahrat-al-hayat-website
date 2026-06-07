"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useReveal } from "@/hooks/use-reveal";
import Botanical from "@/components/public/Botanical";

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
    <section className="section-y section-x relative overflow-hidden border-y border-border/60 bg-background">
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3 text-center">
          <Botanical variant="bloom" className="h-10 w-10 text-primary/40" strokeWidth={1.5} />
          <h2 className="font-display text-3xl font-medium leading-[1.1] text-foreground sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
        </div>
        <div
          ref={gridRef}
          className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0 rtl:sm:divide-x-reverse"
        >
          {items.map((it) => (
            <div key={it.valueKey} className="flex flex-col items-center gap-3 px-4 py-8 text-center sm:py-2">
              <span className="font-display text-6xl font-medium leading-none text-primary lg:text-7xl">
                <StatNumber value={t(it.valueKey)} />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-sm">
                {t(it.labelKey)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
