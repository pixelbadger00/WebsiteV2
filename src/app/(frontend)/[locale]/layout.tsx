import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL, getGermanEnabled, clinicJsonLd } from "@/lib/seo";
import { pick } from "@/lib/i18n-content";
import { getSiteSettings, getDoctor, getHomePage } from "@/sanity/queries";
import { headingSerif, inter } from "../../fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileActions from "@/components/MobileActions";
import JsonLd from "@/components/JsonLd";
import MotionProvider from "@/components/motion/MotionProvider";
import ConsentMode, { GtmNoScript } from "@/components/analytics/ConsentMode";
import ConsentBanner from "@/components/analytics/ConsentBanner";
import AnalyticsListener from "@/components/analytics/AnalyticsListener";
import CalPopup from "@/components/booking/CalPopup";
import { MobileUIProvider } from "@/components/mobile/MobileUIProvider";
import MobileMenu from "@/components/mobile/MobileMenu";
import "../../globals.css";

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK;

const OG_LOCALE: Record<Locale, string> = {
  el: "el_GR",
  en: "en_GB",
  de: "de_DE",
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const [germanEnabled, home] = await Promise.all([getGermanEnabled(), getHomePage()]);
  // German shell is noindex until content exists and germanEnabled is flipped.
  const noindex = locale === "de" && !germanEnabled;

  // Default share image: the real hero photo, resized to 1200×630 by the Sanity
  // CDN. Pages may override openGraph.images with their own image.
  const heroUrl = home?.heroImage?.asset?.url;
  const ogImage = heroUrl
    ? [{ url: `${heroUrl}?w=1200&h=630&fit=crop&auto=format`, width: 1200, height: 630 }]
    : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t("siteName")} — ${t("tagline")}`,
      template: `%s · ${t("siteName")}`,
    },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      locale: OG_LOCALE[locale as Locale] ?? "el_GR",
      ...(ogImage ? { images: ogImage } : {}),
    },
    twitter: { card: "summary_large_image" },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "A11y" });
  const [settings, doctor] = await Promise.all([getSiteSettings(), getDoctor()]);
  const clinic = clinicJsonLd({
    siteName: pick(settings?.siteName, locale as Locale) ?? "Dr Paris Papakostas",
    doctorName: pick(doctor?.name, locale as Locale),
    phone: settings?.contact?.phone,
    email: settings?.contact?.email,
    address: pick(settings?.address, locale as Locale),
    mapUrl: settings?.mapUrl,
    locale: locale as Locale,
  });

  return (
    <html lang={locale} className={`${headingSerif.variable} ${inter.variable}`}>
      <head>
        {/* Speed up the LCP hero image (served from the Sanity CDN). */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <JsonLd data={clinic} />
        {/* Consent Mode v2 defaults (all denied) + GTM — only if configured. */}
        <ConsentMode />
      </head>
      <body className="flex min-h-screen flex-col pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-0">
        <GtmNoScript />
        <NextIntlClientProvider>
          <MotionProvider>
          <MobileUIProvider>
            <a className="skip-link" href="#main">
              {t("skip")}
            </a>
            <Header />
            <MobileMenu />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <MobileActions />
            <AnalyticsListener />
            {CAL_LINK ? <CalPopup /> : null}
            <ConsentBanner />
          </MobileUIProvider>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
