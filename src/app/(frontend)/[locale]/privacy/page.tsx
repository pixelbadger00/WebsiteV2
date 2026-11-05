import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { fixedPathAlternates, getGermanEnabled } from "@/lib/seo";
import LegalPageView, { getLegalTitle } from "@/components/LegalPageView";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const t = await getTranslations({ locale, namespace: "Footer" });
  const germanEnabled = await getGermanEnabled();
  return {
    title: await getLegalTitle("privacy", locale, t("privacy")),
    alternates: fixedPathAlternates(locale, "/privacy", germanEnabled),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale: localeStr } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const t = await getTranslations("Footer");
  return (
    <LegalPageView kind="privacy" locale={locale} fallbackTitle={t("privacy")} tbc={t("hoursTbc")} />
  );
}
