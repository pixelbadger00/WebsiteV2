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
} from "@/lib/seo";
import { getPostBySlug, getAllPostSlugs } from "@/sanity/queries";
import ImageBox from "@/components/ImageBox";
import PortableContent from "@/components/PortableContent";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  const params: { locale: string; slug: string }[] = [];
  for (const s of slugs) {
    if (s.el) {
      params.push({ locale: "el", slug: s.el });
    }
    if (s.en) {
      params.push({ locale: "en", slug: s.en });
    }
    if (s.de) {
      params.push({ locale: "de", slug: s.de });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr, slug } = await params;
  const locale = localeStr as Locale;
  const post = await getPostBySlug(slug);
  if (!post) {
    return {};
  }
  const title = pick(post.seo?.metaTitle, locale) ?? pick(post.title, locale);
  const description =
    pick(post.seo?.metaDescription, locale) ??
    pick(post.excerpt, locale) ??
    firstParagraph(pick(post.body, locale));
  const germanEnabled = await getGermanEnabled();
  const paths = {
    el: post.slug?.el?.current ? `/blog/${post.slug.el.current}` : undefined,
    en: post.slug?.en?.current ? `/blog/${post.slug.en.current}` : undefined,
    de: post.slug?.de?.current ? `/blog/${post.slug.de.current}` : undefined,
  };
  return {
    title,
    ...(description ? { description } : {}),
    alternates: buildAlternates(locale, paths, germanEnabled),
  };
}

function firstParagraph(pt: unknown, max = 200): string {
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

export default async function BlogPostPage({ params }: Props) {
  const { locale: localeStr, slug } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const t = await getTranslations("Blog");
  const nav = await getTranslations("Nav");

  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const title = pick(post.title, locale);
  const date = formatDate(post.publishedAt, locale);
  const body = pick(post.body, locale);

  const breadcrumbLd = breadcrumbJsonLd([
    { name: nav("blog"), url: absoluteUrl(locale, "/blog") },
    { name: title ?? "", url: absoluteUrl(locale, `/blog/${slug}`) },
  ]);

  return (
    <article className="mx-auto max-w-[760px] px-6 py-10 md:py-16">
      <JsonLd data={breadcrumbLd} />
      <p className="text-[0.85rem] text-slate-600">
        <Link href="/blog" className="hover:text-accent">
          {nav("blog")}
        </Link>
      </p>

      <header className="mt-4">
        <h1 className="text-[clamp(2rem,4.5vw,3rem)]">{title}</h1>
        {date ? (
          <time dateTime={post.publishedAt} className="mt-3 block text-[0.9rem] text-slate-600">
            {date}
          </time>
        ) : null}
      </header>

      {post.coverImage?.asset ? (
        <ImageBox
          image={post.coverImage}
          alt={title ?? ""}
          priority
          sizes="(max-width: 800px) 100vw, 760px"
          className="mt-8 aspect-[16/9] rounded-card"
        />
      ) : null}

      {body ? (
        <div className="mt-8">
          <PortableContent value={body} />
        </div>
      ) : null}

      <div className="mt-12 border-t border-slate-300 pt-6">
        <Link href="/blog" className="font-semibold text-accent hover:text-accent-700">
          ← {t("backToList")}
        </Link>
      </div>
    </article>
  );
}
