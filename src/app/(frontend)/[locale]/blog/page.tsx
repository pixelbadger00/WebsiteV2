import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { fixedPathAlternates, getGermanEnabled } from "@/lib/seo";
import { getPosts } from "@/sanity/queries";
import ImageBox from "@/components/ImageBox";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const t = await getTranslations({ locale, namespace: "Nav" });
  const germanEnabled = await getGermanEnabled();
  return {
    title: t("blog"),
    alternates: fixedPathAlternates(locale, "/blog", germanEnabled),
  };
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

export default async function BlogIndex({ params }: Props) {
  const { locale: localeStr } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const t = await getTranslations("Blog");
  const nav = await getTranslations("Nav");

  const posts = await getPosts();
  // Only show posts that have a slug in the active locale (no fallback), so a
  // Greek-only article never appears on /en with an untranslated URL.
  const visible = posts.filter((p) => p.slug?.[locale]?.current);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
      <h1 className="text-[clamp(2.1rem,4.5vw,3rem)]">{nav("blog")}</h1>

      {visible.length === 0 ? (
        <p className="mt-8 max-w-[60ch] text-slate-600">{t("empty")}</p>
      ) : (
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {visible.map((post) => {
            const slug = post.slug?.[locale]?.current as string;
            const date = formatDate(post.publishedAt, locale);
            return (
              <StaggerItem key={post._id} className="h-full">
              <Link
                href={`/blog/${slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-card border border-slate-300 bg-surface shadow-[var(--shadow-soft)] transition-colors hover:border-accent"
              >
                <ImageBox
                  image={post.coverImage}
                  alt={pick(post.title, locale) ?? ""}
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="aspect-[16/9]"
                />
                <div className="flex flex-1 flex-col p-5">
                  {date ? (
                    <time dateTime={post.publishedAt} className="text-[0.8rem] text-slate-600">
                      {date}
                    </time>
                  ) : null}
                  <h2 className="mt-1 font-serif text-[1.25rem] font-semibold">
                    {pick(post.title, locale)}
                  </h2>
                  {pick(post.excerpt, locale) ? (
                    <p className="mt-2 text-slate-600">{pick(post.excerpt, locale)}</p>
                  ) : null}
                  <span className="mt-3 font-semibold text-accent group-hover:text-accent-700">
                    {t("readMore")} →
                  </span>
                </div>
              </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </section>
  );
}
