"use client";

import { useState, useEffect } from "react";

interface SiteSettings {
  logoUrl: string | null;
  facebookUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
}

const DEFAULT: SiteSettings = {
  logoUrl: null,
  facebookUrl: "",
  instagramUrl: "",
  whatsappNumber: "",
};

let cachedSettings: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

function fetchSettings(): Promise<SiteSettings> {
  if (cachedSettings) return Promise.resolve(cachedSettings);
  if (!fetchPromise) {
    fetchPromise = fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        cachedSettings = {
          logoUrl: data.logoUrl ?? null,
          facebookUrl: data.facebookUrl ?? "",
          instagramUrl: data.instagramUrl ?? "",
          whatsappNumber: data.whatsappNumber ?? "",
        };
        return cachedSettings;
      })
      .catch(() => DEFAULT);
  }
  return fetchPromise;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings ?? DEFAULT);

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  return settings;
}
