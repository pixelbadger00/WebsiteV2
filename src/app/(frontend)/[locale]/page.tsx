import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { fixedPathAlternates, getGermanEnabled } from "@/lib/seo";
import {
  getSiteSettings,
  getHomePage,
  getProcedures,
  getDoctor,
  getTestimonials,
  getOfficeImage,
  getPosts,
} from "@/sanity/queries";
import SanityImage from "@/components/SanityImage";
import ImageBox from "@/components/ImageBox";
import BookButton from "@/components/BookButton";
import { heroImageSources } from "@/sanity/lib/heroImage";
import Reveal from "@/components/motion/Reveal";
import RevealImage from "@/components/motion/RevealImage";
import HeroReveal from "@/components/motion/HeroReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const [home, settings, germanEnabled] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
    getGermanEnabled(),
  ]);
  const description =
    pick(home?.heroLead, locale) ?? pick(settings?.tagline, locale) ?? undefined;
  return {
    ...(description ? { description } : {}),
    alternates: fixedPathAlternates(locale, "/", germanEnabled),
  };
}

const HERO_PHOTO = "Paris papacostas new office 2026-30.jpg";
const PORTRAIT_PHOTO = "Paris papacostas new office 2026-27.jpg";
const TREATMENT_PHOTO = "Paris papacostas new office 2026-11.jpg";

function firstParagraph(pt: unknown, max = 300): string {
  if (!Array.isArray(pt)) {
    return "";
  }
  for (const b of pt) {
    const block = b as { _type?: string; style?: string; children?: { text?: string }[] };
    if (block._type === "block" && (block.style === "normal" || !block.style)) {
      const text = (block.children ?? []).map((c) => c.text ?? "").join("").trim();
      if (text) {
        return text.length > max ? text.slice(0, max).trim() + "…" : text;
      }
    }
  }
  return "";
}

function formatDate(iso: string | undefined, locale: Locale): string {
  if (!iso) {
    return "";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(d);
}

function clip(text: string | undefined, max: number): string {
  if (!text) {
    return "";
  }
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max).trim()}…` : t;
}

export default async function HomePage({ params }: Props) {
  const { locale: localeStr } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const cta = await getTranslations("Cta");
  const nav = await getTranslations("Nav");
  const proc = await getTranslations("Procedure");
  const blog = await getTranslations("Blog");
  const homeT = await getTranslations("Home");
  const carousel = await getTranslations("Carousel");

  const [
    settings,
    home,
    procedures,
    doctor,
    testimonials,
    posts,
    heroFallback,
    portraitImg,
    treatmentImg,
  ] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getProcedures(),
    getDoctor(),
    getTestimonials(locale, 12),
    getPosts(),
    getOfficeImage(HERO_PHOTO),
    getOfficeImage(PORTRAIT_PHOTO),
    getOfficeImage(TREATMENT_PHOTO),
  ]);

  // Recent articles for the home teaser: only those with a slug in the active
  // locale (no fallback), newest first, max 3. Mirrors the original site's
  // "Articles & news" block.
  const recentPosts = posts.filter((p) => p.slug?.[locale]?.current).slice(0, 3);

  // Hero image (same-origin via Netlify Image CDN in prod; hotspot → object-position).
  const heroImage = home?.heroImage?.asset ? home.heroImage : heroFallback;
  const heroBaseUrl = heroImage?.asset?.url;
  const hero = heroBaseUrl ? heroImageSources(heroBaseUrl) : null;
  const hs = home?.heroImage?.hotspot;
  // The hero photo is mirrored (scaleX(-1)) so the doctor sits on the right,
  // clear of the left-aligned text; flip the focal x to keep the framing.
  const hx = hs && typeof hs.x === "number" ? hs.x * 100 : 42;
  const hy = hs && typeof hs.y === "number" ? hs.y * 100 : 38;
  const heroPos = `${(100 - hx).toFixed(1)}% ${hy.toFixed(1)}%`;
  const heroAlt =
    home?.heroImage?.alt ?? pick(settings?.siteName, locale) ?? "Dr Paris Papakostas";

  const trust = (home?.trustBadges ?? [])
    .map((b) => pick(b, locale))
    .filter((v): v is string => Boolean(v));

  // Category labels for the credential strip. Guarded to the confirmed 4-fact
  // set so a content change can't mis-label; empty → facts render without labels.
  const credLabels =
    trust.length === 4
      ? [
          homeT("credQualification"),
          homeT("credTraining"),
          homeT("credFocus"),
          homeT("credClinic"),
        ]
      : [];

  const featured = procedures[0];
  const rest = procedures.slice(1);
  const procHref = (p: (typeof procedures)[number]) => {
    const slug = pick(p.slug, locale)?.current;
    return slug ? `/service/${slug}` : undefined;
  };

  const timeline = (doctor?.timeline ?? []).filter(
    (t) => pick(t.year, locale) && pick(t.label, locale),
  );

  const phone = settings?.contact?.phone;
  const phoneHref = phone ? phone.replace(/\s+/g, "") : undefined;
  const address = pick(settings?.address, locale);

  return (
    <>
      {hero ? (
        <link
          rel="preload"
          as="image"
          href={hero.src}
          imageSrcSet={hero.srcSet}
          imageSizes="100vw"
          fetchPriority="high"
        />
      ) : null}

      {/* ── Full-screen hero: headline + credential strip on one screen ── */}
      <section className="relative isolate flex min-h-[calc(100svh_-_4.5rem)] flex-col overflow-hidden bg-slate-900 text-white">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element -- same-origin hero via Netlify Image CDN
          <img
            src={hero.src}
            srcSet={hero.srcSet}
            sizes="100vw"
            alt={heroAlt}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            // scaleX(-1): mirror so the doctor is on the right. scale(1.15) +
            // translateX nudges him further right (the zoom leaves cover so the
            // shift never exposes an edge).
            style={{ objectPosition: heroPos, transform: "translateX(5%) scaleX(-1) scale(1.15)" }}
          />
        ) : null}
        {/* Scrims: darken the left + lower area so the text + strip stay legible. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/92 via-ink/55 to-ink/10 md:to-transparent" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />

        {/* Headline — fills the space above the strip, vertically centred */}
        <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-6 py-12 md:px-10">
          <div className={locale === "el" ? "max-w-[52ch]" : "max-w-[44ch]"}>
            {pick(home?.heroEyebrow, locale) ? (
              <HeroReveal as="p" delay={0.05} className="eyebrow-light">
                {pick(home?.heroEyebrow, locale)}
              </HeroReveal>
            ) : null}
            <h1
              className={`mt-4 text-[length:var(--text-display)] leading-[1.03] text-white ${
                locale === "el" ? "max-w-[52ch]" : "max-w-[26ch]"
              }`}
            >
              {pick(home?.heroTitle, locale)}
            </h1>
            {pick(home?.heroLead, locale) ? (
              <HeroReveal as="p" delay={0.18} className="mt-6 max-w-[54ch] text-[length:var(--text-lead)] text-white/85">
                {pick(home?.heroLead, locale)}
              </HeroReveal>
            ) : null}
            <HeroReveal delay={0.3} className="mt-8">
              <BookButton className="btn btn-light">{cta("book")}</BookButton>
            </HeroReveal>
          </div>
        </div>

        {/* Credential strip — bottom of the hero, visible without scrolling */}
        {trust.length > 0 ? (
          <HeroReveal delay={0.42} y={24} className="border-t border-white/15 bg-ink/65">
            <ul className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-8 gap-y-4 px-6 py-4 md:px-10 md:py-4 lg:grid-cols-4 lg:gap-x-0">
              {trust.map((item, i) => (
                <li
                  key={item}
                  className={`lg:px-8 lg:first:pl-0 lg:last:pr-0${
                    i !== 0 ? " lg:border-l lg:border-white/15" : ""
                  }`}
                >
                  {credLabels[i] ? (
                    <p className="mb-0.5 text-[0.72rem] font-semibold tracking-[0.03em] text-white/55 [font-variant-caps:all-small-caps]">
                      {credLabels[i]}
                    </p>
                  ) : null}
                  <p className="font-serif text-[0.98rem] leading-[1.25] tracking-[-0.01em] text-white">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </HeroReveal>
        ) : null}
      </section>

      {/* ── Procedures: editorial masthead + featured + list (real photos) ── */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-x-16 gap-y-6 border-b border-line pb-10 md:grid-cols-[1.05fr_0.95fr] md:items-end md:pb-12">
          <Reveal>
            <p className="eyebrow">{nav("procedures")}</p>
            {pick(home?.proceduresTitle, locale) ? (
              <h2 className="mt-3 max-w-[18ch] text-balance text-[length:var(--text-h2)]">
                {pick(home?.proceduresTitle, locale)}
              </h2>
            ) : null}
          </Reveal>
          <Reveal>
            {pick(home?.proceduresIntro, locale) ? (
              <p className="max-w-[48ch] text-[1.05rem] text-slate-600">
                {pick(home?.proceduresIntro, locale)}
              </p>
            ) : null}
            <Link
              href="/services"
              className="link-underline mt-5 inline-block font-semibold text-accent"
            >
              {proc("viewAll")}
            </Link>
          </Reveal>
        </div>

        {featured ? (
          <Reveal className="mt-12">
            <Link
              href={procHref(featured) ?? "/services"}
              className="proc-tile group block overflow-hidden rounded-lg"
            >
              <div className="relative aspect-[16/11] sm:aspect-[16/9] lg:aspect-[21/9]">
                <ImageBox
                  image={featured.heroImage}
                  alt=""
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="h-full w-full"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-11 lg:max-w-[70%]">
                  <p className="eyebrow-light">{nav("procedures")}</p>
                  <h3 className="mt-2 font-serif text-[clamp(1.7rem,3vw,2.5rem)] font-semibold leading-[1.05] text-white">
                    {pick(featured.name, locale)}
                  </h3>
                  <div className="proc-more">
                    {/* Description: tablet / desktop only — dropped on mobile. */}
                    {pick(featured.summary, locale) ? (
                      <p className="mt-3 hidden max-w-[60ch] text-white/85 sm:block">
                        {pick(featured.summary, locale)}
                      </p>
                    ) : null}
                    <span className="link-underline mt-4 inline-block font-semibold text-white">
                      {cta("learnMore")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        ) : null}

        {rest.length > 0 ? (
          <Stagger className="mt-7 grid gap-7 md:grid-cols-2">
            {rest.map((proc) => {
              const href = procHref(proc);
              const inner = (
                <div className="relative aspect-[16/11] h-full sm:aspect-[16/10]">
                  <ImageBox
                    image={proc.heroImage}
                    alt=""
                    sizes="(max-width: 768px) 100vw, 620px"
                    className="h-full w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
                    <h3 className="font-serif text-[1.35rem] font-semibold leading-tight text-white">
                      {pick(proc.name, locale)}
                    </h3>
                    <div className="proc-more">
                      {/* Description: tablet / desktop only — dropped on mobile. */}
                      {pick(proc.summary, locale) ? (
                        <p className="mt-2 hidden line-clamp-3 text-[0.95rem] text-white/85 sm:block">
                          {pick(proc.summary, locale)}
                        </p>
                      ) : null}
                      <span className="link-underline mt-3 inline-block text-[0.95rem] font-semibold text-white">
                        {cta("learnMore")}
                      </span>
                    </div>
                  </div>
                </div>
              );
              return (
                <StaggerItem key={proc._id}>
                  {href ? (
                    <Link
                      href={href}
                      className="proc-tile group block h-full overflow-hidden rounded-card"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="proc-tile block h-full overflow-hidden rounded-card">{inner}</div>
                  )}
                </StaggerItem>
              );
            })}
          </Stagger>
        ) : null}
      </section>

      {/* ── Doctor: large portrait + short bio + timeline ── */}
      {doctor ? (
        <section className="bg-surface">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[0.9fr_1.1fr]">
            <RevealImage className="relative aspect-[4/5] overflow-hidden rounded-card bg-slate-900">
              <SanityImage
                image={doctor.portrait?.asset ? doctor.portrait : portraitImg}
                alt={pick(doctor.name, locale) ?? ""}
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="h-full w-full object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
            </RevealImage>
            <Reveal>
              {pick(home?.aboutEyebrow, locale) ? (
                <p className="eyebrow">{pick(home?.aboutEyebrow, locale)}</p>
              ) : null}
              <h2 className="mt-2 text-[length:var(--text-h2)]">{pick(doctor.name, locale)}</h2>
              <p className="mt-4 max-w-[58ch] text-[1.05rem] text-slate-600">
                {firstParagraph(pick(doctor.bio, locale))}
              </p>

              {timeline.length > 0 ? (
                <ul className="mt-7 space-y-3 border-t border-line pt-6">
                  {timeline.map((t, i) => (
                    <li key={i} className="grid grid-cols-[7rem_1fr] gap-4">
                      <span className="font-serif text-[1.05rem] font-semibold text-accent">
                        {pick(t.year, locale)}
                      </span>
                      <span className="text-slate-600">{pick(t.label, locale)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {pick(home?.aboutCtaLabel, locale) ? (
                <Link href="/about-the-doctor" className="btn btn-secondary mt-8">
                  {pick(home?.aboutCtaLabel, locale)}
                </Link>
              ) : null}
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ── Articles & news (recent posts; mirrors the original site) ── */}
      {recentPosts.length > 0 ? (
        <section className="bg-surface">
          <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-24">
            <div className="grid gap-x-16 gap-y-5 border-b border-line pb-8 md:grid-cols-[1fr_auto] md:items-end md:pb-10">
              <Reveal>
                <p className="eyebrow">{homeT("newsEyebrow")}</p>
                <h2 className="mt-3 text-[length:var(--text-h2)]">{homeT("newsTitle")}</h2>
              </Reveal>
              <Reveal className="md:pb-1">
                <Link
                  href="/blog"
                  className="link-underline inline-block font-semibold text-accent"
                >
                  {blog("backToList")}
                </Link>
              </Reveal>
            </div>

            <Stagger className="mt-10 grid gap-7 md:grid-cols-3">
              {recentPosts.map((post) => {
                const pslug = post.slug?.[locale]?.current as string;
                const date = formatDate(post.publishedAt, locale);
                return (
                  <StaggerItem key={post._id}>
                    <Link
                      href={`/blog/${pslug}`}
                      className="card card-hover group flex h-full flex-col overflow-hidden"
                    >
                      <div className="card-zoom relative aspect-[16/10] overflow-hidden rounded-t-card">
                        <ImageBox
                          image={post.coverImage}
                          alt=""
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="h-full w-full"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        {date ? (
                          <time
                            dateTime={post.publishedAt}
                            className="text-[0.82rem] text-slate-500"
                          >
                            {date}
                          </time>
                        ) : null}
                        <h3 className="mt-1.5 font-serif text-[1.25rem] font-semibold">
                          {pick(post.title, locale)}
                        </h3>
                        {pick(post.excerpt, locale) ? (
                          <p className="mt-2 line-clamp-3 text-slate-600">
                            {pick(post.excerpt, locale)}
                          </p>
                        ) : null}
                        <span className="mt-4 font-semibold text-accent group-hover:text-accent-700">
                          {blog("readMore")}
                        </span>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* ── Treatment in Cyprus teaser (editorial, matches doctor/articles) ── */}
      <section className="bg-accent-50">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow">{nav("treatment")}</p>
            <h2 className="mt-3 max-w-[18ch] text-[length:var(--text-h2)]">
              {homeT("treatmentTitle")}
            </h2>
            <p className="mt-5 max-w-[52ch] text-[1.05rem] text-slate-600">
              {homeT("treatmentBody")}
            </p>
            <BookButton className="btn btn-primary mt-8">
              {homeT("treatmentCta")}
            </BookButton>
          </Reveal>
          <RevealImage className="relative aspect-[4/3] overflow-hidden rounded-card bg-slate-900">
            <SanityImage
              image={treatmentImg}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="h-full w-full object-cover"
              style={{ objectPosition: "50% 45%" }}
            />
          </RevealImage>
        </div>
      </section>

      {/* ── Testimonials (only consented reviews; see enable-testimonials.ts) ── */}
      {testimonials.length > 0 ? (
        <section className="bg-surface">
          <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-24">
            <Reveal className="max-w-[62ch]">
              {pick(home?.reviewsEyebrow, locale) ? (
                <p className="eyebrow">{pick(home?.reviewsEyebrow, locale)}</p>
              ) : null}
              <h2 className="mt-3 text-[length:var(--text-h2)]">
                {pick(home?.reviewsTitle, locale)}
              </h2>
            </Reveal>
            <TestimonialsCarousel
              prevLabel={carousel("prev")}
              nextLabel={carousel("next")}
              items={testimonials.map((item) => ({
                _id: item._id,
                quote: clip(item.quote, 260),
                author: item.author ?? "",
                language: item.language,
                procedure: pick(item.procedureName, locale) ?? null,
              }))}
            />
          </div>
        </section>
      ) : null}

      {/* ── Closing CTA (invitation + contact cluster) ── */}
      {pick(home?.closingCtaTitle, locale) ? (
        <section className="bg-accent text-white">
          <Reveal className="mx-auto flex max-w-[1280px] flex-col justify-center gap-10 px-6 py-20 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-16 md:px-10 md:py-28">
            <div>
              <h2 className="max-w-[20ch] text-[length:var(--text-h2)] text-white">
                {pick(home?.closingCtaTitle, locale)}
              </h2>
              {pick(home?.closingCtaBody, locale) ? (
                <p className="mt-4 max-w-[52ch] text-white/85">
                  {pick(home?.closingCtaBody, locale)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-6 md:items-end">
              <BookButton className="btn btn-light">{cta("book")}</BookButton>
              {phoneHref ? (
                <div className="md:text-right">
                  <p className="eyebrow-light">{cta("call")}</p>
                  <a
                    href={`tel:${phoneHref}`}
                    className="link-underline font-serif text-[1.35rem] text-white"
                  >
                    {phone}
                  </a>
                </div>
              ) : null}
              {address ? (
                <p className="max-w-[32ch] text-[0.92rem] leading-relaxed text-white/70 md:text-right">
                  {address}
                </p>
              ) : null}
            </div>
          </Reveal>
        </section>
      ) : null}
    </>
  );
}
