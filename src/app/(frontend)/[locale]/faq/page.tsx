import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import {
  fixedPathAlternates,
  getGermanEnabled,
  absoluteUrl,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";
import { getFaqPage, getFaqs } from "@/sanity/queries";
import type { PortableText } from "@/sanity/types";
import PortableContent from "@/components/PortableContent";
import JsonLd from "@/components/JsonLd";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type Props = { params: Promise<{ locale: string }> };

// Plain-text of a Portable Text answer, for the FAQPage JSON-LD `text` field.
function toPlainText(blocks: PortableText | undefined): string {
  if (!Array.isArray(blocks)) {
    return "";
  }
  return blocks
    .map((b) => {
      const block = b as { _type?: string; children?: { text?: string }[] };
      if (block._type !== "block") {
        return "";
      }
      return (block.children ?? []).map((c) => c.text ?? "").join("");
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const [nav, page, germanEnabled] = await Promise.all([
    getTranslations({ locale, namespace: "Nav" }),
    getFaqPage(),
    getGermanEnabled(),
  ]);
  const title = pick(page?.seo?.metaTitle, locale) ?? pick(page?.title, locale) ?? nav("faq");
  const description = pick(page?.seo?.metaDescription, locale);
  return {
    title,
    ...(description ? { description } : {}),
    alternates: fixedPathAlternates(locale, "/faq", germanEnabled),
  };
}

export default async function FaqPage({ params }: Props) {
  const { locale: localeStr } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const nav = await getTranslations("Nav");

  const [page, faqs] = await Promise.all([getFaqPage(), getFaqs()]);
  const title = pick(page?.title, locale) ?? nav("faq");
  const intro = pick(page?.body, locale);

  // Keep only questions with both a question and an answer in this locale
  // (pick() enforces "no Greek fallback on /en", so an untranslated item drops).
  const items = faqs
    .map((f) => ({
      id: f._id,
      question: pick(f.question, locale),
      answer: pick(f.answer, locale),
    }))
    .filter(
      (it): it is { id: string; question: string; answer: PortableText } =>
        Boolean(it.question) && Array.isArray(it.answer) && it.answer.length > 0,
    );

  const breadcrumbLd = breadcrumbJsonLd([
    { name: title, url: absoluteUrl(locale, "/faq") },
  ]);
  const jsonLdItems = items.map((it) => ({
    question: it.question,
    answer: toPlainText(it.answer),
  }));

  return (
    <section className="mx-auto max-w-[760px] px-6 py-14 md:py-20">
      <JsonLd data={breadcrumbLd} />
      {jsonLdItems.length > 0 ? <JsonLd data={faqPageJsonLd(jsonLdItems)} /> : null}

      <h1 className="text-[clamp(2rem,4.5vw,3rem)]">{title}</h1>

      {intro ? (
        <div className="mt-6 text-slate-600">
          <PortableContent value={intro} />
        </div>
      ) : null}

      {items.length > 0 ? (
        <Stagger className="mt-8" step={0.05}>
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <details className="border-b border-slate-300">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold">
                  {item.question}
                  <span aria-hidden className="faq-ico text-xl text-accent">
                    +
                  </span>
                </summary>
                <div className="pb-4 leading-[1.7] text-slate-600">
                  <PortableContent value={item.answer} />
                </div>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}

      <div className="mt-8">
        <Link href="/contact" className="font-semibold text-accent hover:text-accent-700">
          {nav("contact")} →
        </Link>
      </div>
    </section>
  );
}
