import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { fixedPathAlternates, getGermanEnabled } from "@/lib/seo";
import { getProcedures } from "@/sanity/queries";
import ImageBox from "@/components/ImageBox";
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
  const cta = await getTranslations("Cta");
  const procedures = await getProcedures();

  return (
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
  );
}
