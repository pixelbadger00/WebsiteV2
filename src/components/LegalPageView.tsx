import { getLegalPage } from "@/sanity/queries";
import { pick } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { LegalPage } from "@/sanity/types";
import PortableContent from "./PortableContent";

type Kind = NonNullable<LegalPage["kind"]>;

export async function getLegalTitle(
  kind: Kind,
  locale: Locale,
  fallback: string,
): Promise<string> {
  const page = await getLegalPage(kind);
  return pick(page?.title, locale) ?? fallback;
}

export default async function LegalPageView({
  kind,
  locale,
  fallbackTitle,
  tbc,
}: {
  kind: Kind;
  locale: Locale;
  fallbackTitle: string;
  tbc: string;
}) {
  const page = await getLegalPage(kind);
  const title = pick(page?.title, locale) ?? fallbackTitle;
  const body = pick(page?.body, locale);

  return (
    <section className="mx-auto max-w-[760px] px-6 py-14 md:py-20">
      <h1 className="text-[clamp(2rem,4.5vw,3rem)]">{title}</h1>
      {body ? (
        <div className="mt-6">
          <PortableContent value={body} />
        </div>
      ) : (
        <p className="mt-6 text-slate-600">
          <em>{tbc}</em>
        </p>
      )}
    </section>
  );
}
