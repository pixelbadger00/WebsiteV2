import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { CONTACT } from "@/lib/config";
import { fixedPathAlternates, getGermanEnabled } from "@/lib/seo";
import { getProcedures, getSiteSettings } from "@/sanity/queries";
import ImageBox from "@/components/ImageBox";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/motion/Reveal";
import RevealImage from "@/components/motion/RevealImage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const t = await getTranslations({ locale, namespace: "Procedure" });
  const germanEnabled = await getGermanEnabled();
  return {
    title: t("indexTitle"),
    description: t("indexIntro"),
    alternates: fixedPathAlternates(locale, "/services", germanEnabled),
  };
}

export default async function ProceduresIndex({ params }: Props) {
  const { locale: localeStr } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const t = await getTranslations("Procedure");
  const tt = await getTranslations("Treatment");
  const tc = await getTranslations("Contact");
  const nav = await getTranslations("Nav");
  const cta = await getTranslations("Cta");
  const [procedures, settings] = await Promise.all([getProcedures(), getSiteSettings()]);

  const address = pick(settings?.address, locale);
  const mapUrl = settings?.mapUrl ?? CONTACT.mapUrl;
  const hours = settings?.openingHours ?? [];

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-24">
        <Reveal className="max-w-[62ch]">
          <p className="eyebrow">{t("breadcrumb")}</p>
          <h1 className="mt-3 text-[length:var(--text-h1)]">{t("indexTitle")}</h1>
          <p className="mt-5 text-[length:var(--text-lead)] text-slate-600">{t("indexIntro")}</p>
        </Reveal>

        <div className="mt-14 divide-y divide-line md:mt-20">
          {procedures.map((proc, i) => {
            const slug = pick(proc.slug, locale)?.current;
            const flip = i % 2 === 1;
            const content = (
              <article className="grid items-center gap-8 py-10 md:grid-cols-2 md:gap-14 md:py-14">
                <RevealImage
                  className={`card-zoom relative aspect-[4/3] overflow-hidden rounded-card ${flip ? "md:order-2" : ""}`}
                >
                  <ImageBox
                    image={proc.heroImage}
                    alt=""
                    sizes="(max-width: 768px) 100vw, 580px"
                    className="h-full w-full"
                    priority={i === 0}
                  />
                </RevealImage>
                <Reveal className={flip ? "md:order-1" : ""}>
                  <p className="eyebrow">{`0${i + 1}`}</p>
                  <h2 className="mt-2 font-serif text-[clamp(1.5rem,2.6vw,2rem)] font-semibold">
                    {pick(proc.name, locale)}
                  </h2>
                  {pick(proc.summary, locale) ? (
                    <p className="mt-4 max-w-[52ch] text-slate-600">{pick(proc.summary, locale)}</p>
                  ) : null}
                  {slug ? (
                    <span className="mt-5 inline-block font-semibold text-accent group-hover:text-accent-700">
                      {cta("learnMore")}
                    </span>
                  ) : null}
                </Reveal>
              </article>
            );
            return slug ? (
              <Link key={proc._id} href={`/service/${slug}`} className="group block">
                {content}
              </Link>
            ) : (
              <div key={proc._id}>{content}</div>
            );
          })}
        </div>
      </div>

      {/* The clinic (merged in from the former Treatment-in-Cyprus page) */}
      <section className="bg-surface">
        <Reveal className="mx-auto max-w-[1200px] px-6 py-14 md:py-20">
          <h2 className="text-[length:var(--text-h2)]">{tt("clinicHeading")}</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {address ? (
              <div>
                <address className="not-italic whitespace-pre-line text-slate-600">
                  {address}
                </address>
                {mapUrl ? (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block min-h-11 py-1 font-semibold text-accent hover:text-accent-700"
                  >
                    {tc("directions")} →
                  </a>
                ) : null}
              </div>
            ) : null}
            {hours.length > 0 ? (
              <div>
                <h3 className="font-sans text-[0.8rem] font-semibold tracking-wider text-accent uppercase">
                  {tc("hours")}
                </h3>
                <ul className="mt-2 space-y-1 text-slate-600">
                  {hours.map((h, i) => (
                    <li key={i} className="flex justify-between gap-6">
                      <span className="capitalize">{h.day}</span>
                      <span>{h.closed ? "—" : `${h.opens ?? ""}–${h.closes ?? ""}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Reveal>
      </section>

      {/* CTA (merged in from the former Treatment-in-Cyprus page) */}
      <section className="bg-accent text-white">
        <Reveal className="mx-auto max-w-[1200px] px-6 py-16 text-center">
          <h2 className="text-[clamp(1.6rem,3vw,2.25rem)] text-white">{nav("treatment")}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <BookButton className="inline-flex min-h-12 items-center rounded-full bg-white px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-white/90">
              {cta("book")}
            </BookButton>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              {nav("contact")}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
