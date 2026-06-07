"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { X, ArrowClockwise } from "@phosphor-icons/react";
import { useReveal } from "@/hooks/use-reveal";

interface GalleryItem {
  id: string;
  title?: string | null;
  imageUrl: string;
}

type ApiGalleryItem = {
  id: string;
  url: string;
  titleAr?: string | null;
  titleEn?: string | null;
  isPublished?: boolean;
};

export default function Gallery() {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState<GalleryItem | null>(null);

  const headRef = useReveal<HTMLDivElement>({ stagger: 0.1 });
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.08, distance: 40 });

  const fetchItems = useCallback(() => {
    fetch("/api/gallery")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        const raw: ApiGalleryItem[] = Array.isArray(data) ? data : data.items ?? [];
        setItems(
          raw
            .filter((x) => x.isPublished !== false && x.url)
            .map((x) => ({ id: x.id, imageUrl: x.url, title: isRtl ? x.titleAr : x.titleEn }))
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isRtl]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const retry = () => {
    setLoading(true);
    setError(false);
    fetchItems();
  };

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  if (!loading && !error && items.length === 0) return null;

  return (
    <section id="gallery" className="section-y section-x bg-background">
      <div className="mx-auto max-w-7xl">
        <div ref={headRef} className="max-w-2xl mx-auto text-center flex flex-col gap-3 mb-10 lg:mb-14">
          <span className="eyebrow mx-auto">{t("label")}</span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-[1.05]">
            {t("title")}
          </h2>
          <p className="text-base text-muted-foreground">{t("subtitle")}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-3xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">{isRtl ? "تعذّر تحميل المعرض" : "Couldn't load the gallery"}</p>
            <button type="button" onClick={retry} className="btn-pill btn-pill-ghost">
              <ArrowClockwise size={16} weight="bold" />
              {isRtl ? "إعادة المحاولة" : "Try again"}
            </button>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 [&>*]:mb-3 sm:[&>*]:mb-4"
          >
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item)}
                className={`group relative block w-full overflow-hidden rounded-3xl bg-secondary break-inside-avoid ${
                  i % 3 === 0 ? "aspect-3/4" : i % 3 === 1 ? "aspect-square" : "aspect-4/5"
                }`}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title ?? ""}
                  fill
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {item.title && (
                  <span className="absolute bottom-3 start-3 end-3 text-start text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
                    {item.title}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[80] bg-foreground/85 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-5 end-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center"
          >
            <X size={20} weight="bold" />
          </button>
          <div className="relative max-w-5xl w-full max-h-[85vh] aspect-3/4 sm:aspect-4/3" onClick={(e) => e.stopPropagation()}>
            <Image
              src={active.imageUrl}
              alt={active.title ?? ""}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
