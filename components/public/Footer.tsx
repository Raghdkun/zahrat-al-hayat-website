"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  MapPin,
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  WhatsappLogo,
  ArrowRight,
  ArrowLeft,
} from "@phosphor-icons/react";

export default function Footer() {
  const t = useTranslations("footer");
  const tnav = useTranslations("nav");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const { logoUrl, facebookUrl, instagramUrl, whatsappNumber } = useSiteSettings();

  return (
    <footer className="bg-secondary/60 border-t border-border">
      <div className="mx-auto max-w-7xl section-x py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          {/* Brand block */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-bold">زه</span>
                </div>
              )}
              <span className="font-display text-2xl font-semibold text-foreground">
                {t("brand_name")}
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
              {t("brand_description")}
            </p>
            <Link href="/book" className="btn-pill btn-pill-primary self-start mt-2">
              {tnav("book")}
              <Arrow size={16} weight="bold" />
            </Link>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              {t("quick_links")}
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">{tnav("home")}</Link></li>
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">{tnav("about")}</a></li>
              <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors">{tnav("services")}</a></li>
              <li><a href="#founder" className="text-muted-foreground hover:text-primary transition-colors">{tnav("founder")}</a></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">{tnav("blog")}</Link></li>
              <li><Link href="/book" className="text-muted-foreground hover:text-primary transition-colors">{tnav("book")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              {t("contact")}
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <MapPin size={18} weight="duotone" className="shrink-0 text-primary" />
                <span>{t("location")}</span>
              </li>
              <li className="flex items-center gap-3">
                <EnvelopeSimple size={18} weight="duotone" className="shrink-0 text-primary" />
                <a href="mailto:contact@zahrat-alhayat.com" className="hover:text-primary transition-colors">
                  contact@zahrat-alhayat.com
                </a>
              </li>
            </ul>
            <div className="flex gap-2.5 mt-2">
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                   className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <FacebookLogo weight="fill" size={18} />
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                   className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <InstagramLogo weight="fill" size={18} />
                </a>
              )}
              {whatsappUrl(whatsappNumber) && (
                <a href={whatsappUrl(whatsappNumber)!} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                   className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-[#25d366] hover:text-white hover:border-[#25d366] transition-all">
                  <WhatsappLogo weight="fill" size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>{t("rights")}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">{t("privacy")}</a>
            <a href="#" className="hover:text-primary transition-colors">{t("terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
