"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { House, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Botanical from "@/components/public/Botanical";

export default function NotFound() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <>
      <Navbar />
      <main className="paper-grain section-x relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary/30 pt-28 pb-20">
        <Botanical
          variant="bloom"
          className="pointer-events-none absolute -top-10 -start-10 h-72 w-72 text-primary/[0.06]"
        />
        <Botanical
          variant="sprig"
          className="pointer-events-none absolute -bottom-10 -end-8 h-64 w-64 rotate-12 text-secondary/40"
        />

        <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
          <Botanical variant="stem" className="h-16 w-16 text-primary/50" strokeWidth={1.5} />
          <span className="font-display text-7xl font-medium leading-none text-primary sm:text-8xl">
            {isRtl ? "٤٠٤" : "404"}
          </span>
          <h1 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
            {isRtl ? "الصفحة غير موجودة" : "Page not found"}
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            {isRtl
              ? "عذراً، الصفحة التي تبحث عنها غير متوفرة أو ربما تم نقلها. لنعد بك إلى المسار الصحيح."
              : "Sorry, the page you're looking for doesn't exist or may have moved. Let's get you back on track."}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/" className="btn-pill btn-pill-primary">
              <House size={18} weight="bold" />
              {isRtl ? "العودة إلى الرئيسية" : "Back to home"}
            </Link>
            <Link href="/book" className="btn-pill btn-pill-ghost">
              {isRtl ? "احجز استشارة" : "Book a consultation"}
              <Arrow size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
