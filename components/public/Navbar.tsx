"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useRef, useEffect, useState, useCallback } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import gsap from "gsap";
import { Globe, List, X, ArrowRight, ArrowLeft } from "@phosphor-icons/react";

const NAV_ITEMS = [
  { href: "/" as const, labelKey: "home" },
  { href: "/blog" as const, labelKey: "blog" },
  { href: "/book" as const, labelKey: "book" },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { logoUrl } = useSiteSettings();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const switchLocale = useCallback(() => {
    router.replace(pathname, { locale: isRtl ? "en" : "ar" });
  }, [router, pathname, isRtl]);

  // Entrance
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  // Solid background after scrolling past hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body when mobile sheet open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const brandName = isRtl ? "زهرة الحياة" : "Zahrat Al Hayat";

  return (
    <>
      <nav
        ref={navRef}
        dir={isRtl ? "rtl" : "ltr"}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border/60"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 h-16 sm:h-18 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={brandName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">زه</span>
              </div>
            )}
            <span className="font-display text-lg sm:text-xl font-semibold text-foreground whitespace-nowrap">
              {brandName}
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-7 text-sm font-medium">
            {NAV_ITEMS.map(({ href, labelKey }) => {
              const isActive =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`relative py-1 transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    {t(labelKey)}
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-primary" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right side: locale + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={switchLocale}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors"
              aria-label={isRtl ? tc("english") : tc("arabic")}
            >
              <Globe size={16} weight="bold" />
              <span>{isRtl ? tc("english") : tc("arabic")}</span>
            </button>
            <Link href="/book" className="btn-pill btn-pill-primary !py-2.5 !px-5 text-sm">
              {t("book")}
              <Arrow size={14} weight="bold" />
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full text-foreground hover:bg-foreground/5 transition-colors"
            aria-label="Open menu"
          >
            <List size={22} weight="bold" />
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          dir={isRtl ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 end-0 w-[88vw] max-w-sm bg-background shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-border">
              <span className="font-display text-lg font-semibold">{brandName}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="h-10 w-10 rounded-full inline-flex items-center justify-center hover:bg-foreground/5"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <ul className="flex flex-col px-5 py-6 gap-1">
              {NAV_ITEMS.map(({ href, labelKey }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-lg font-display text-foreground border-b border-border/50"
                  >
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-lg font-display text-foreground border-b border-border/50"
                >
                  {t("login")}
                </Link>
              </li>
            </ul>
            <div className="mt-auto p-5 flex flex-col gap-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  switchLocale();
                  setMobileOpen(false);
                }}
                className="inline-flex items-center justify-center gap-2 text-sm text-foreground/80 py-2"
              >
                <Globe size={16} weight="bold" />
                {isRtl ? tc("english") : tc("arabic")}
              </button>
              <Link
                href="/book"
                onClick={() => setMobileOpen(false)}
                className="btn-pill btn-pill-primary"
              >
                {t("book")}
                <Arrow size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
