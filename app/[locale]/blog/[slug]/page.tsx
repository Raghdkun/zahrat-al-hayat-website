"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { CircleNotch, ArrowLeft, ArrowRight } from "@phosphor-icons/react";

interface BlogPost {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  coverImage: string | null;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogPostPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const t = useTranslations("blog");
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  const Back = isRtl ? ArrowRight : ArrowLeft;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:gap-2 transition-all mb-8"
          >
            <Back size={16} weight="bold" />
            {t("label")}
          </Link>

          {loading ? (
            <div className="flex justify-center py-16">
              <CircleNotch className="h-8 w-8 animate-spin text-primary" weight="bold" />
            </div>
          ) : notFound ? (
            <div className="text-center py-16 text-muted-foreground">
              {isRtl ? "المقال غير موجود" : "Post not found"}
            </div>
          ) : (
            post && (
              <article className="flex flex-col gap-8">
                <header className="flex flex-col gap-4">
                  <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-[1.1]">
                    {isRtl ? post.titleAr || post.titleEn : post.titleEn || post.titleAr}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {post.authorName && (
                      <span>
                        {t("by")} <span className="text-foreground font-medium">{post.authorName}</span>
                      </span>
                    )}
                    <span>·</span>
                    <span>
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
                        isRtl ? "ar-SA" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </span>
                  </div>
                </header>

                {post.coverImage && (
                  <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-secondary">
                    <Image
                      src={post.coverImage}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 768px, 100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:text-foreground prose-p:text-foreground/85 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-img:rounded-2xl"
                  dangerouslySetInnerHTML={{
                    __html: isRtl ? post.contentAr || post.contentEn : post.contentEn || post.contentAr,
                  }}
                />
              </article>
            )
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
