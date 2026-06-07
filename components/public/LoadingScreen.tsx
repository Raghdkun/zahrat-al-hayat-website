"use client";

import { useEffect, useState } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const { logoUrl } = useSiteSettings();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = p < 60 ? 4 : p < 85 ? 6 : 9;
        return Math.min(p + increment, 100);
      });
    }, 35);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => setFadeOut(true), 250);
      const t2 = setTimeout(() => setVisible(false), 900);
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }
  }, [progress]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-700 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[260px] h-[260px] rounded-full bg-accent/40 blur-[90px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-7">
        <div className={`transition-transform duration-700 ${progress < 100 ? "scale-100" : "scale-105"}`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Zahrat Al Hayat"
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-full"
            />
          ) : (
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-3xl font-display font-medium">زه</span>
            </div>
          )}
        </div>

        <div className="text-center">
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-foreground">
            زهرة الحياة
          </h1>
          <p className="text-muted-foreground text-xs mt-1.5 tracking-[0.3em] uppercase">
            Zahrat Al Hayat
          </p>
        </div>

        <div className="w-48 sm:w-56 h-[2px] bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
