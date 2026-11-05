import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { normalizeBio } from "@/lib/portable-clean";
import { fixedPathAlternates, getGermanEnabled } from "@/lib/seo";
import { getDoctor, getSiteSettings, getOfficeImage } from "@/sanity/queries";
import SanityImage from "@/components/SanityImage";
import PortableContent from "@/components/PortableContent";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type Props = { params: Promise<{ locale: string }> };

// Fallback portrait until doctor.portrait is assigned in Studio.
const PORTRAIT_PHOTO = "Paris papacostas new office 2026-27.jpg";

// Doctor name prefixed with the per-locale title (never hard-coded; "Dr. med."
// on /de stays empty until confirmed). siteSettings.titlePrefix drives it.
// Skip the prefix when the name already begins with it (avoids "Dr. Dr …").
function fullName(
  prefix: string | undefined,
  name: string | undefined,
): string {
  const n = (name ?? "").trim();
  const p = (prefix ?? "").trim();
  if (!p) {
    return n;
  }
  const bare = p.replace(/\.$/, "").toLowerCase();
  if (n.toLowerCase().startsWith(bare)) {
    return n;
  }
  return `${p} ${n}`.trim();
}

function firstParagraph(pt: unknown, max = 200): string {
  if (!Array.isArray(pt)) {
    return "";
  }
  for (const b of pt) {
    const block = b as {
      _type?: string;
      style?: string;
      children?: { text?: string }[];
    };
    if (block._type === "block" && (block.style === "normal" || !block.style)) {
      const text = (block.children ?? []).map((c) => c.text ?? "").join("").trim();
      if (text) {
        return text.length > max ? text.slice(0, max).trim() + "…" : text;
      }
    }
  }
  return "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const [doctor, settings] = await Promise.all([getDoctor(), getSiteSettings()]);
  if (!doctor) {
    return {};
  }
  const name = fullName(pick(settings?.titlePrefix, locale), pick(doctor.name, locale));
  const description =
    pick(doctor.seo?.metaDescription, locale) ??
    pick(doctor.shortBio, locale) ??
    firstParagraph(pick(doctor.bio, locale));
  const germanEnabled = await getGermanEnabled();
  return {
    title: pick(doctor.seo?.metaTitle, locale) ?? name,
    ...(description ? { description } : {}),
    alternates: fixedPathAlternates(locale, "/about-the-doctor", germanEnabled),
  };
}

export default async function AboutDoctorPage({ params }: Props) {
  const { locale: localeStr } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const t = await getTranslations();

  const [doctor, settings, portraitFallback] = await Promise.all([
    getDoctor(),
    getSiteSettings(),
    getOfficeImage(PORTRAIT_PHOTO),
  ]);

  if (!doctor) {
    notFound();
  }

  const name = fullName(pick(settings?.titlePrefix, locale), pick(doctor.name, locale));
  const shortBio = pick(doctor.shortBio, locale);
  const bio = normalizeBio(pick(doctor.bio, locale));
  const portrait = doctor.portrait?.asset ? doctor.portrait : portraitFallback;

  const credentials = (doctor.credentials ?? [])
    .map((c) => pick(c, locale))
    .filter((v): v is string => Boolean(v));
  const memberships = (doctor.memberships ?? [])
    .map((m) => pick(m, locale))
    .filter((v): v is string => Boolean(v));
  const registrations = (doctor.registrationNumbers ?? []).filter(Boolean);

  return (
    <>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1200px] px-6 pt-6">
        <p className="text-[0.85rem] text-slate-600">
          <Link href="/" className="hover:text-accent">
            {t("Meta.siteName")}
          </Link>{" "}
          › <span className="text-ink">{t("Nav.about")}</span>
        </p>
      </div>

      {/* Intro */}
      <section className="mx-auto max-w-[1200px] px-6 py-8 md:py-14">
        <div className="grid items-center gap-10 md:grid-cols-[0.82fr_1.18fr] md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-slate-900">
            <SanityImage
              image={portrait}
              alt={name || (pick(doctor.name, locale) ?? "")}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 480px"
              className="h-full w-full object-cover"
              style={{ objectPosition: "50% 30%" }}
            />
          </div>
          <Reveal>
            <p className="eyebrow">{t("Nav.about")}</p>
            <h1 className="mt-3 text-[length:var(--text-h1)]">{name}</h1>
            {shortBio ? (
              <p className="mt-5 max-w-[56ch] text-[length:var(--text-lead)] text-slate-600">
                {shortBio}
              </p>
            ) : null}
            <div className="mt-8">
              <BookButton className="btn btn-primary">{t("Cta.book")}</BookButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Biography */}
      {bio ? (
        <section className="bg-surface">
          <Reveal className="mx-auto max-w-[760px] px-6 py-14 md:py-20">
            <PortableContent value={bio} />
          </Reveal>
        </section>
      ) : null}

      {/* Credentials / memberships / registration — rendered only when present
          (no invented qualifications; missing data is simply omitted). */}
      {credentials.length > 0 || memberships.length > 0 || registrations.length > 0 ? (
        <section className="mx-auto max-w-[760px] px-6 py-14 md:py-16">
          <Stagger className="grid gap-10 sm:grid-cols-2">
            {credentials.length > 0 ? (
              <StaggerItem>
                <h2 className="eyebrow mb-3">{t("About.credentials")}</h2>
                <ul className="space-y-2 text-slate-600">
                  {credentials.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </StaggerItem>
            ) : null}
            {memberships.length > 0 ? (
              <StaggerItem>
                <h2 className="eyebrow mb-3">{t("About.memberships")}</h2>
                <ul className="space-y-2 text-slate-600">
                  {memberships.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </StaggerItem>
            ) : null}
            {registrations.length > 0 ? (
              <StaggerItem className="sm:col-span-2">
                <h2 className="eyebrow mb-3">{t("About.registration")}</h2>
                <p className="text-slate-600">{registrations.join(" · ")}</p>
              </StaggerItem>
            ) : null}
          </Stagger>
        </section>
      ) : null}

      {/* CTA */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1200px] px-6 pb-16">
          <Reveal className="flex flex-col items-center gap-4 rounded-lg border border-line bg-porcelain px-6 py-10 text-center sm:flex-row sm:justify-center">
            <BookButton className="btn btn-primary">{t("Cta.book")}</BookButton>
            <Link href="/contact" className="btn btn-secondary">
              {t("Nav.contact")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
