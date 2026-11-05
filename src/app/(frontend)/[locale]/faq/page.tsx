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
import { getFaqPage } from "@/sanity/queries";
import PortableContent from "@/components/PortableContent";
import JsonLd from "@/components/JsonLd";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type Props = { params: Promise<{ locale: string }> };
type QA = { question: string; answer: string };

const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

// The migrated FAQ body stores one Q&A per block: the first non-empty span is
// the (numbered) question, the rest is the answer. Parse into clean pairs.
function parseFaq(blocks: unknown): QA[] {
  if (!Array.isArray(blocks)) {
    return [];
  }
  const out: QA[] = [];
  for (const b of blocks) {
    const block = b as { _type?: string; children?: { text?: string }[] };
    if (block._type !== "block") {
      continue;
    }
    const parts = (block.children ?? [])
      .map((c) => normalize(c.text ?? ""))
      .filter(Boolean);
    const first = parts[0];
    if (!first || parts.length < 2) {
      continue;
    }
    const question = first.replace(/^\s*\d+[.)]\s*/, "").trim();
    const answer = parts.slice(1).join(" ").trim();
    if (question && answer) {
      out.push({ question, answer });
    }
  }
  return out;
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

  const page = await getFaqPage();
  const title = pick(page?.title, locale) ?? nav("faq");
  const items = parseFaq(pick(page?.body, locale));

  const breadcrumbLd = breadcrumbJsonLd([
    { name: title, url: absoluteUrl(locale, "/faq") },
  ]);

  return (
    <section className="mx-auto max-w-[760px] px-6 py-14 md:py-20">
      <JsonLd data={breadcrumbLd} />
      {items.length > 0 ? <JsonLd data={faqPageJsonLd(items)} /> : null}

      <h1 className="text-[clamp(2rem,4.5vw,3rem)]">{title}</h1>

      {items.length > 0 ? (
        <Stagger className="mt-8" step={0.05}>
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <details className="border-b border-slate-300">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold">
                  {item.question}
                  <span aria-hidden className="faq-ico text-xl text-accent">
                    +
                  </span>
                </summary>
                <p className="pb-4 leading-[1.7] text-slate-600">{item.answer}</p>
              </details>
            </StaggerItem>
          ))}
        </Stagger>
      ) : pick(page?.body, locale) ? (
        // Fallback: render the raw body if the Q&A couldn't be parsed.
        <div className="mt-8">
          <PortableContent value={pick(page?.body, locale)} />
        </div>
      ) : null}

      <div className="mt-12 border-t border-slate-300 pt-6">
        <Link href="/contact" className="font-semibold text-accent hover:text-accent-700">
          {nav("contact")} →
        </Link>
      </div>
    </section>
  );
}
