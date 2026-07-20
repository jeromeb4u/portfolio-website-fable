import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { routing, type Locale } from "@/i18n/routing";
import { getSiteSettings, getNavigation } from "@/lib/data";
import { buildLanguageAlternates, buildOpenGraph, absoluteUrl } from "@/lib/seo";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { AmbientBackground } from "@/components/motion/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";
import "./globals.css";

// Self-hosted at build time via next/font — no runtime Google request,
// no cookie-consent implications (plan/01 §2). latin-ext covers German umlauts.
const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: { default: title, template: "%s — Jerome D'mello" },
    description,
    alternates: {
      canonical: absoluteUrl(`/${locale}`),
      languages: buildLanguageAlternates(""),
    },
    openGraph: buildOpenGraph({ locale, title, description, path: "" }),
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // The bilingual flip needs BOTH locales' labels: the CMS stores each nav
  // item + CTA per locale, so we fetch the other locale too and pair by index.
  const otherLocale: Locale = locale === "de" ? "en" : "de";
  const [settings, navigation, altNavigation, tCommon, tFooter] =
    await Promise.all([
      getSiteSettings(locale as Locale),
      getNavigation(locale as Locale),
      getNavigation(otherLocale),
      getTranslations("common"),
      getTranslations("footer"),
    ]);
  const altItems = altNavigation.items ?? [];

  return (
    <html
      lang={locale}
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <AmbientBackground />
        <PersonJsonLd
          email={settings.email}
          socialUrls={(settings.socials ?? [])
            .filter((s) => s.platform !== "email")
            .map((s) => s.url)}
        />
        <NextIntlClientProvider>
          <SmoothScrollProvider>
            <a
              href="#content"
              className="mono-label sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
            >
              {tCommon("skipToContent")}
            </a>
            <Header
              siteName={settings.siteName}
              items={(navigation.items ?? []).map((i, idx) => ({
                label: i.label,
                anchor: i.anchor,
                altLabel: altItems[idx]?.label ?? i.label,
              }))}
              ctaLabel={navigation.ctaLabel}
              ctaAltLabel={altNavigation.ctaLabel ?? navigation.ctaLabel}
              openMenuLabel={tCommon("openMenu")}
              closeMenuLabel={tCommon("closeMenu")}
            />
            <main id="content">{children}</main>
            <Footer
              siteName={settings.siteName}
              tagline={settings.tagline}
              email={settings.email}
              socials={(settings.socials ?? []).map((s) => ({
                platform: s.platform,
                url: s.url,
              }))}
              availability={settings.availability}
              availabilityNote={settings.availabilityNote ?? undefined}
              contactLabel={tFooter("contact")}
              imprintLabel={tFooter("imprint")}
              privacyLabel={tFooter("privacy")}
              locale={locale}
            />
            <Toaster position="bottom-right" />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
