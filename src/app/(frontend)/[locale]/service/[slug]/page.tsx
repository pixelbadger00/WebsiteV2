import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import {
  buildAlternates,
  getGermanEnabled,
  absoluteUrl,
  breadcrumbJsonLd,
  medicalProcedureJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";
import { getProcedureBySlug, getAllProcedureSlugs, getProcedures } from "@/sanity/queries";
import ImageBox from "@/components/ImageBox";
import BookButton from "@/components/BookButton";
import PortableContent from "@/components/PortableContent";
import JsonLd from "@/components/JsonLd";
import StickyNav from "@/components/StickyNav";
import Accordion from "@/components/motion/Accordion";
import Reveal from "@/components/motion/Reveal";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllProcedureSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const s of slugs) {
    if (s.el) params.push({ locale: "el", slug: s.el });
    if (s.en) params.push({ locale: "en", slug: s.en });
    if (s.de) params.push({ locale: "de", slug: s.de });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr, slug } = await params;
  const locale = localeStr as Locale;
  const proc = await getProcedureBySlug(slug);
  if (!proc) {
    return {};
  }
  const title = pick(proc.seo?.metaTitle, locale) ?? pick(proc.name, locale);
  const description = pick(proc.seo?.metaDescription, locale) ?? pick(proc.summary, locale);
  const germanEnabled = await getGermanEnabled();
  const paths = {
    el: proc.slug?.el?.current ? `/service/${proc.slug.el.current}` : undefined,
    en: proc.slug?.en?.current ? `/service/${proc.slug.en.current}` : undefined,
    de: proc.slug?.de?.current ? `/service/${proc.slug.de.current}` : undefined,
  };
  return { title, description, alternates: buildAlternates(locale, paths, germanEnabled) };
}

export default async function ProcedurePage({ params }: Props) {
  const { locale: localeStr, slug } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const t = await getTranslations("Procedure");
  const cta = await getTranslations("Cta");

  const [proc, allProcs] = await Promise.all([getProcedureBySlug(slug), getProcedures()]);
  if (!proc) {
    notFound();
  }

  const name = pick(proc.name, locale);
  const body = pick(proc.body, locale);
  const faqItems = (proc.faqs ?? [])
    .map((f) => ({ q: pick(f.question, locale), a: pick(f.answer, locale) }))
    .filter((f): f is { q: string; a: string } => Boolean(f.q) && Boolean(f.a));

  const pageUrl = absoluteUrl(locale, `/service/${slug}`);
  const procedureLd = medicalProcedureJsonLd({
    name: name ?? "",
    description: pick(proc.summary, locale),
    url: pageUrl,
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: t("breadcrumb"), url: absoluteUrl(locale, "/services") },
    { name: name ?? "", url: pageUrl },
  ]);

  const navItems = [
    { id: "overview", label: t("navOverview") },
    ...(proc.animations?.some((a) => a.video?.url)
      ? [{ id: "animation", label: t("animationTitle") }]
      : []),
    { id: "expect", label: t("navExpect") },
    ...(faqItems.length > 0 ? [{ id: "faq", label: t("navFaq") }] : []),
  ];
  const steps = [
    { t: t("step1Title"), b: t("step1Body") },
    { t: t("step2Title"), b: t("step2Body") },
    { t: t("step3Title"), b: t("step3Body") },
  ];
  const related = allProcs
    .filter((p) => pick(p.slug, locale)?.current && pick(p.slug, locale)?.current !== slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd data={procedureLd} />
      <JsonLd data={breadcrumbLd} />
      {faqItems.length > 0 ? (
        <JsonLd data={faqPageJsonLd(faqItems.map((f) => ({ question: f.q, answer: f.a })))} />
      ) : null}

      {/* Large image header (LCP; no entrance animation) */}
      <section className="relative isolate overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 -z-10">
          <ImageBox
            image={proc.heroImage}
            alt=""
            priority
            sizes="100vw"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/45 to-slate-900/30" />
        </div>
        <div className="mx-auto flex min-h-[46svh] max-w-[1280px] flex-col justify-end px-6 py-12 md:px-10 md:py-16">
          <p className="text-[0.85rem] text-white/80">
            <Link href="/services" className="link-underline hover:text-white">
              {t("breadcrumb")}
            </Link>
          </p>
          <h1 className="mt-3 max-w-[18ch] text-[length:var(--text-h1)] text-white">{name}</h1>
          {pick(proc.summary, locale) ? (
            <p className="mt-4 max-w-[58ch] text-[length:var(--text-lead)] text-white/90">
              {pick(proc.summary, locale)}
            </p>
          ) : null}
          <div className="mt-7">
            <BookButton className="btn btn-light">{cta("book")}</BookButton>
          </div>
        </div>
      </section>

      {/* Body + sticky in-page nav */}
      <div className="mx-auto max-w-[1280px] px-6 py-14 md:px-10 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[200px_1fr] lg:gap-16">
          <aside>
            <p className="eyebrow mb-3">{t("onThisPage")}</p>
            <StickyNav items={navItems} />
          </aside>

          <div className="max-w-[720px]">
            {/* Risks / consultation callout */}
            <Reveal className="rounded-card border border-accent/20 bg-accent-50 p-5 text-[0.95rem] text-slate-700">
              {t("risksNote")}
            </Reveal>

            {/* Overview */}
            {body ? (
              <section id="overview" className="mt-12">
                <Reveal>
                  <h2 className="text-[length:var(--text-h2)]">{t("navOverview")}</h2>
                </Reveal>
                <Reveal className="mt-4">
                  <PortableContent value={body} />
                </Reveal>
              </section>
            ) : null}

            {/* 3D animations (click-to-play, with controls). Orientation-
                agnostic: portrait and landscape clips both fit within the
                column, capped by height, without distortion. */}
            {proc.animations?.some((a) => a.video?.url) ? (
              <section id="animation" className="mt-14 border-t border-line pt-12">
                <Reveal>
                  <h2 className="text-[length:var(--text-h2)]">{t("animationTitle")}</h2>
                </Reveal>
                <div className="mt-6 space-y-8">
                  {proc.animations
                    .filter((a) => a.video?.url)
                    .map((a, i) => (
                      <Reveal key={i} delay={i * 0.05}>
                        {a.title ? (
                          <p className="mb-2 font-serif text-[1.1rem] text-slate-800">
                            {a.title}
                          </p>
                        ) : null}
                        {/* Fixed 16:9 frame so every clip is the same height
                            regardless of orientation; portrait clips are
                            centered (object-contain) within it. */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-card bg-slate-900">
                          <video
                            controls
                            preload="metadata"
                            playsInline
                            poster={a.poster?.asset?.url}
                            className="h-full w-full object-contain"
                          >
                            <source
                              src={a.video!.url}
                              type={a.video!.mimeType ?? "video/mp4"}
                            />
                          </video>
                        </div>
                        {a.credit ? (
                          <p className="mt-2 text-[0.8rem] text-slate-500">{a.credit}</p>
                        ) : null}
                      </Reveal>
                    ))}
                </div>
              </section>
            ) : null}

            {/* What to expect (true sequence → numbered) */}
            <section id="expect" className="mt-14 border-t border-line pt-12">
              <Reveal>
                <h2 className="text-[length:var(--text-h2)]">{t("expectTitle")}</h2>
              </Reveal>
              <ol className="mt-6 space-y-6">
                {steps.map((s, i) => (
                  <Reveal as="li" key={i} delay={i * 0.05} className="grid grid-cols-[3rem_1fr] gap-5">
                    <span className="font-serif text-[1.6rem] font-semibold text-accent/50">
                      {`0${i + 1}`}
                    </span>
                    <div>
                      <h3 className="font-serif text-[1.2rem] font-semibold">{s.t}</h3>
                      <p className="mt-1.5 text-slate-600">{s.b}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </section>

            {/* FAQ (animated accordion) */}
            {faqItems.length > 0 ? (
              <section id="faq" className="mt-14 border-t border-line pt-12">
                <Reveal>
                  <h2 className="mb-6 text-[length:var(--text-h2)]">{t("faqTitle")}</h2>
                </Reveal>
                <Accordion items={faqItems} />
              </section>
            ) : null}
          </div>
        </div>
      </div>

      {/* Related procedures */}
      {related.length > 0 ? (
        <section className="bg-surface">
          <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
            <Reveal>
              <h2 className="text-[length:var(--text-h2)]">{t("relatedTitle")}</h2>
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p) => {
                const rslug = pick(p.slug, locale)?.current as string;
                return (
                  <Link
                    key={p._id}
                    href={`/service/${rslug}`}
                    className="card card-hover group block overflow-hidden"
                  >
                    <div className="card-zoom relative aspect-[16/10] overflow-hidden rounded-t-card">
                      <ImageBox
                        image={p.heroImage}
                        alt=""
                        sizes="(max-width: 768px) 100vw, 380px"
                        className="h-full w-full"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-[1.15rem] font-semibold">
                        {pick(p.name, locale)}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="bg-accent text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-16 text-center md:px-10">
          <h2 className="mx-auto max-w-[24ch] text-[length:var(--text-h2)] text-white">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-[58ch] text-white/90">{t("ctaBody")}</p>
          <BookButton className="btn btn-light mt-8">{cta("book")}</BookButton>
        </div>
      </section>
    </>
  );
}
