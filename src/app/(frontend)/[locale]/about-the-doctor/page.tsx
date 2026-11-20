import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { fullName } from "@/lib/doctor-name";
import { normalizeBio } from "@/lib/portable-clean";
import { fixedPathAlternates, getGermanEnabled } from "@/lib/seo";
import { getDoctor, getSiteSettings, getOfficeImage, getHomePage } from "@/sanity/queries";
import SanityImage from "@/components/SanityImage";
import PortableContent from "@/components/PortableContent";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type Props = { params: Promise<{ locale: string }> };

// Fallback portrait until doctor.portrait is assigned in Studio.
const PORTRAIT_PHOTO = "Paris papacostas new office 2026-27.jpg";

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

  const [doctor, settings, portraitFallback, home] = await Promise.all([
    getDoctor(),
    getSiteSettings(),
    getOfficeImage(PORTRAIT_PHOTO),
    getHomePage(),
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
  const timeline = (doctor.timeline ?? []).filter(
    (item) => pick(item.year, locale) && pick(item.label, locale),
  );

  const phone = settings?.contact?.phone;
  const phoneHref = phone ? phone.replace(/\s+/g, "") : undefined;
  const address = pick(settings?.address, locale);
  const ctaTitle = pick(home?.closingCtaTitle, locale);
  const ctaBody = pick(home?.closingCtaBody, locale);

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

      {/* Training & career timeline — moved to the top, on a clean white band
          (year + label; same spine style as home). */}
      {timeline.length > 0 ? (
        <section className="bg-white">
          <Reveal className="mx-auto max-w-[760px] px-6 pt-14 pb-8 md:pt-16 md:pb-10">
            <h2 className="eyebrow mb-5">{t("About.career")}</h2>
            <ul className="border-t border-line pt-6">
              {timeline.map((item, i) => (
                <li key={i} className="grid grid-cols-[6rem_1fr] items-baseline sm:grid-cols-[7rem_1fr]">
                  <span className="whitespace-nowrap font-serif text-[1rem] font-semibold tabular-nums text-accent">
                    {pick(item.year, locale)}
                  </span>
                  <span
                    className={`border-l border-line pl-5 text-[0.98rem] leading-snug text-slate-600 ${
                      i < timeline.length - 1 ? "pb-5" : ""
                    }`}
                  >
                    {pick(item.label, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      ) : null}

      {/* Biography */}
      {bio ? (
        <section className="bg-surface">
          <Reveal className="mx-auto max-w-[760px] px-6 pt-8 pb-14 md:pt-10 md:pb-20">
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

      {/* Closing CTA — invitation + contact cluster (mirrors the home design:
          dark accent band, title/body left, Book + Call + address right). */}
      {ctaTitle ? (
        <section className="bg-accent text-white">
          <Reveal className="mx-auto flex max-w-[1280px] flex-col justify-center gap-10 px-6 py-20 md:grid md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-16 md:px-10 md:py-24">
            <div>
              <h2 className="max-w-[20ch] text-[length:var(--text-h2)] text-white">
                {ctaTitle}
              </h2>
              {ctaBody ? (
                <p className="mt-4 max-w-[52ch] text-white/85">{ctaBody}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-6 md:items-end">
              <BookButton className="btn btn-light">{t("Cta.book")}</BookButton>
              {phoneHref ? (
                <div className="md:text-right">
                  <p className="eyebrow-light">{t("Cta.call")}</p>
                  <a
                    href={`tel:${phoneHref}`}
                    data-analytics-event="click_phone"
                    className="link-underline font-serif text-[1.35rem] text-white"
                  >
                    {phone}
                  </a>
                </div>
              ) : null}
              {address ? (
                <p className="max-w-[32ch] whitespace-pre-line text-[0.92rem] leading-relaxed text-white/70 md:text-right">
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
