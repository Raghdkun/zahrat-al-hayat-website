import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Cormorant_Garamond, Inter, Amiri, Cairo } from "next/font/google";
import "@/app/globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const displayEn = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display-en",
  display: "swap",
});

const bodyEn = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-en",
  display: "swap",
});

const displayAr = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-display-ar",
  display: "swap",
});

const bodyAr = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-ar",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zahrat Al Hayat | مركز زهرة الحياة",
  description:
    "مركز زهرة الحياة - رحلة نحو التوازن والشفاء الداخلي | Zahrat Al Hayat Center - A Journey Towards Balance and Inner Healing",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${displayEn.variable} ${bodyEn.variable} ${displayAr.variable} ${bodyAr.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
