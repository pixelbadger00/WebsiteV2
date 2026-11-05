import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { fixedPathAlternates, getGermanEnabled } from "@/lib/seo";
import { getPageBySlug, getProcedures, getSiteSettings } from "@/sanity/queries";
import ImageBox from "@/components/ImageBox";
import PortableContent from "@/components/PortableContent";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type Props = { params: Promise<{ locale: string }> };

const TREATMENT_SLUG = "treatment-in-cyprus";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const [nav, page, germanEnabled] = await Promise.all([
    getTranslations({ locale, namespace: "Nav" }),
    getPageBySlug(TREATMENT_SLUG),
    getGermanEnabled(),
  ]);
  const title = pick(page?.seo?.metaTitle, locale) ?? pick(page?.title, locale) ?? nav("treatment");
  const description = pick(page?.seo?.metaDescription, locale);
  return {
    title,
    ...(description ? { description } : {}),
    alternates: fixedPathAlternates(locale, "/treatment-in-cyprus", germanEnabled),
  };
}

export default async function TreatmentPage({ params }: Props) {
  const { locale: localeStr } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const nav = await getTranslations("Nav");
  const t = await getTranslations("Treatment");
  const tc = await getTranslations("Contact");
  const cta = await getTranslations("Cta");

  const [page, procedures, settings] = await Promise.all([
    getPageBySlug(TREATMENT_SLUG),
    getProcedures(),
    getSiteSettings(),
  ]);

  const body = pick(page?.body, locale);
  const address = pick(settings?.address, locale);
  const mapUrl = settings?.mapUrl;
  const hours = settings?.openingHours ?? [];

  return (
    <>
      {/* Intro */}
      <section className="mx-auto max-w-[1200px] px-6 pt-12 md:pt-16">
        <h1 className="max-w-[18ch] text-[length:var(--text-h1)]">
          {pick(page?.title, locale) ?? nav("treatment")}
        </h1>
        {/* Intro copy only when it exists — no "to be confirmed" on the public site. */}
        {body ? (
          <Reveal className="mt-5 max-w-[62ch] text-[1.05rem] text-slate-600">
            <PortableContent value={body} />
          </Reveal>
        ) : null}
      </section>

      {/* Procedures offered */}
      {procedures.length > 0 ? (
        <section className="mx-auto max-w-[1200px] px-6 py-14 md:py-20">
          <Reveal>
            <h2 className="text-[length:var(--text-h2)]">{t("proceduresHeading")}</h2>
          </Reveal>
          <Stagger className="mt-8 grid gap-6 md:grid-cols-3">
            {procedures.map((proc) => {
              const slug = pick(proc.slug, locale)?.current;
              const inner = (
                <>
                  <div className="card-zoom relative aspect-[4/3] overflow-hidden rounded-t-card">
                    <ImageBox
                      image={proc.heroImage}
                      alt=""
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="mb-1.5 font-serif text-[1.25rem] font-semibold">
                      {pick(proc.name, locale)}
                    </h3>
                    {pick(proc.summary, locale) ? (
                      <p className="text-slate-600">{pick(proc.summary, locale)}</p>
                    ) : null}
                  </div>
                </>
              );
              return (
                <StaggerItem key={proc._id} className="h-full">
                  {slug ? (
                    <Link
                      href={`/service/${slug}`}
                      className="card card-hover group block h-full overflow-hidden"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <article className="card block h-full overflow-hidden">{inner}</article>
                  )}
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>
      ) : null}

      {/* The clinic */}
      <section className="bg-surface">
        <Reveal className="mx-auto max-w-[1200px] px-6 py-14 md:py-20">
          <h2 className="text-[length:var(--text-h2)]">{t("clinicHeading")}</h2>
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

      {/* CTA */}
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
