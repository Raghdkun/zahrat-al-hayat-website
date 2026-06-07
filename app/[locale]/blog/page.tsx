"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { useReveal } from "@/hooks/use-reveal";
import { ArrowRight, ArrowLeft, NotePencil, CircleNotch } from "@phosphor-icons/react";

interface BlogPost {
  id: string;
  titleAr: string;
  titleEn: string;
  slugAr: string;
  slugEn: string;
  excerptAr: string;
  excerptEn: string;
  coverImage: string | null;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogListPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const t = useTranslations("blog");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const headRef = useReveal<HTMLDivElement>({ stagger: 0.1 });
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.1, distance: 50 });

  useEffect(() => {
    let alive = true;
    fetch("/api/blog?published=true")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setPosts(Array.isArray(data) ? data : data.posts ?? []);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div ref={headRef} className="max-w-2xl mx-auto text-center flex flex-col gap-4 mb-14">
            <span className="eyebrow mx-auto">{t("label")}</span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium text-foreground leading-[1.05]">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <CircleNotch className="h-8 w-8 animate-spin text-primary" weight="bold" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">{t("no_posts")}</div>
          ) : (
            <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const title = isRtl ? post.titleAr || post.titleEn : post.titleEn || post.titleAr;
                const excerpt = isRtl ? post.excerptAr || post.excerptEn : post.excerptEn || post.excerptAr;
                const slug = isRtl ? post.slugAr : post.slugEn;
                return (
                  <Link key={post.id} href={`/blog/${slug}`} className="group">
                    <article className="h-full flex flex-col rounded-3xl overflow-hidden bg-card border border-border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={title}
                            fill
                            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/40">
                            <NotePencil size={48} weight="duotone" className="text-primary/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 p-6 flex-1">
                        <h2 className="font-display text-2xl font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {title}
                        </h2>
                        {excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
                          <span>
                            {post.authorName ? `${t("by")} ${post.authorName}` : ""}
                          </span>
                          <span>
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
                              isRtl ? "ar-SA" : "en-US",
                              { year: "numeric", month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-1">
                          {t("read_more")}
                          <Arrow size={14} weight="bold" />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
