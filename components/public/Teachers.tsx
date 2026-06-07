"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CaretLeft, CaretRight, ArrowClockwise, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { useReveal } from "@/hooks/use-reveal";

interface Teacher {
  id: string;
  bioAr?: string | null;
  bioEn?: string | null;
  avatarUrl?: string | null;
  specialties?: string[] | null;
  user: { name: string; email?: string; image?: string | null };
}

export default function Teachers() {
  const t = useTranslations("teachers");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const headRef = useReveal<HTMLDivElement>({ stagger: 0.1 });

  const fetchTeachers = useCallback(() => {
    fetch("/api/teachers?active=true")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setTeachers(Array.isArray(data) ? data : data.teachers ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const retry = () => {
    setLoading(true);
    setError(false);
    fetchTeachers();
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section id="teachers" className="section-y section-x bg-secondary/40">
      <div className="mx-auto max-w-7xl">
        <div ref={headRef} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl flex flex-col gap-3">
            <span className="eyebrow">{t("label")}</span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-[1.05]">
              {t("title")}
            </h2>
            <p className="text-base text-muted-foreground">{t("subtitle")}</p>
          </div>
          {teachers.length > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scroll(isRtl ? "right" : "left")}
                className="w-11 h-11 rounded-full border border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors inline-flex items-center justify-center"
                aria-label="Previous"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => scroll(isRtl ? "left" : "right")}
                className="w-11 h-11 rounded-full border border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors inline-flex items-center justify-center"
                aria-label="Next"
              >
                <CaretRight size={18} weight="bold" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-background/60 border border-border h-80 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{isRtl ? "تعذّر تحميل المدربين" : "Couldn't load coaches"}</p>
            <button type="button" onClick={retry} className="btn-pill btn-pill-ghost">
              <ArrowClockwise size={16} weight="bold" />
              {isRtl ? "إعادة المحاولة" : "Try again"}
            </button>
          </div>
        ) : teachers.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">{t("no_teachers")}</p>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-2 px-2"
          >
            {teachers.map((teacher) => {
              const name = teacher.user?.name ?? "";
              const bio = (isRtl ? teacher.bioAr : teacher.bioEn) || teacher.bioAr || teacher.bioEn || "";
              const initial = name.charAt(0) || "?";
              return (
              <article
                key={teacher.id}
                className="snap-start shrink-0 w-[85%] sm:w-[48%] lg:w-[31%] rounded-3xl bg-background border border-border p-5 flex flex-col gap-4 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/40">
                  {teacher.avatarUrl ? (
                    <Image
                      src={teacher.avatarUrl}
                      alt={name}
                      fill
                      sizes="(min-width:1024px) 360px, 90vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-5xl text-primary/60">
                        {initial}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 px-1">
                  <h3 className="font-display text-2xl font-medium text-foreground">{name}</h3>
                  {bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {bio}
                    </p>
                  )}
                  {teacher.specialties && teacher.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {teacher.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/book?teacher=${teacher.id}`}
                    className="btn-pill btn-pill-primary self-start mt-3 !py-2 !px-4 text-xs"
                  >
                    {t("book_with")}
                    <Arrow size={12} weight="bold" />
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
