import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pick } from "@/lib/i18n-content";
import { fixedPathAlternates, getGermanEnabled } from "@/lib/seo";
import { getContactPage, getSiteSettings } from "@/sanity/queries";
import BookButton from "@/components/BookButton";
import Reveal from "@/components/motion/Reveal";

type Props = { params: Promise<{ locale: string }> };

// Outline icons (heroicons) for the contact detail rows.
const DETAIL_ICONS: Record<string, ReactNode> = {
  call: <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />,
  whatsapp: <path d="M20.25 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.555-.337 5.972 5.972 0 0 1-2.941.572 5.98 5.98 0 0 0 .894-2.028c.09-.457-.133-.901-.467-1.226C3.9 15.77 3 13.98 3 12c0-4.556 4.03-8.25 9-8.25s8.25 3.694 8.25 8.25Z" />,
  email: <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />,
  address: (
    <>
      <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </>
  ),
  hours: <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
};

function DetailIcon({ name }: { name: string }) {
  return (
    <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-accent-50 text-accent">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="size-[18px]"
      >
        {DETAIL_ICONS[name]}
      </svg>
    </span>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const [t, tc, page, germanEnabled] = await Promise.all([
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Contact" }),
    getContactPage(),
    getGermanEnabled(),
  ]);
  const title = pick(page?.seo?.metaTitle, locale) ?? pick(page?.title, locale) ?? t("contact");
  const description = pick(page?.seo?.metaDescription, locale) ?? tc("metaDescription");
  return {
    title,
    description,
    alternates: fixedPathAlternates(locale, "/contact", germanEnabled),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale: localeStr } = await params;
  setRequestLocale(localeStr);
  const locale = localeStr as Locale;
  const t = await getTranslations("Contact");
  const cta = await getTranslations("Cta");

  const [page, settings] = await Promise.all([getContactPage(), getSiteSettings()]);

  const title = pick(page?.title, locale) ?? (await getTranslations("Nav"))("contact");
  const contact = settings?.contact;
  const address = pick(settings?.address, locale);
  const mapUrl = settings?.mapUrl;
  const hours = settings?.openingHours ?? [];
  const telHref = (n: string) => `tel:${n.replace(/[^+\d]/g, "")}`;

  // Keyless Google Maps embed (works in an iframe without an API key).
  const mapQuery = (address ?? "Lordou Vyronos 2, 1096 Nicosia, Cyprus")
    .replace(/\s*\n\s*/g, ", ")
    .trim();
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  return (
    <>
      {/* Header. The migrated page.contact body only duplicated the NAP shown
          in the details column below, so it is intentionally not rendered. */}
      <section className="mx-auto max-w-[1200px] px-6 pt-10 md:pt-14">
        <h1 className="text-[clamp(2rem,4.5vw,3rem)]">{title}</h1>
      </section>

      {/* Get in touch (left) + Book a consultation & map (right white card) */}
      <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-14 md:pb-16 lg:pb-20">
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
          {/* Left — clinic details */}
          <Reveal className="flex h-full flex-col rounded-card border border-line bg-surface p-7 shadow-[var(--shadow-soft)] md:p-9">
            <h2 className="text-[clamp(1.4rem,2.5vw,1.9rem)]">{t("detailsTitle")}</h2>

            <dl className="mt-7 divide-y divide-line">
              {contact?.phone || contact?.mobile ? (
                <div className="flex items-start gap-4 py-4 first:pt-0">
                  <DetailIcon name="call" />
                  <div className="min-w-0">
                    <dt className="eyebrow">{t("call")}</dt>
                    <dd className="mt-0.5">
                      {contact?.phone ? (
                        <a href={telHref(contact.phone)} data-analytics-event="click_phone" className="block py-0.5 text-ink hover:text-accent">
                          {contact.phone}
                        </a>
                      ) : null}
                      {contact?.mobile ? (
                        <a href={telHref(contact.mobile)} data-analytics-event="click_phone" className="block py-0.5 text-ink hover:text-accent">
                          {contact.mobile}
                        </a>
                      ) : null}
                    </dd>
                  </div>
                </div>
              ) : null}

              {contact?.whatsapp ? (
                <div className="flex items-start gap-4 py-4 first:pt-0">
                  <DetailIcon name="whatsapp" />
                  <div className="min-w-0">
                    <dt className="eyebrow">{t("whatsapp")}</dt>
                    <dd className="mt-0.5">
                      <a
                        href={`https://wa.me/${contact.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-analytics-event="click_whatsapp"
                        className="inline-block py-0.5 text-ink hover:text-accent"
                      >
                        +{contact.whatsapp}
                      </a>
                    </dd>
                  </div>
                </div>
              ) : null}

              {contact?.email ? (
                <div className="flex items-start gap-4 py-4 first:pt-0">
                  <DetailIcon name="email" />
                  <div className="min-w-0">
                    <dt className="eyebrow">{t("email")}</dt>
                    <dd className="mt-0.5">
                      <a href={`mailto:${contact.email}`} data-analytics-event="click_email" className="inline-block break-all py-0.5 text-ink hover:text-accent">
                        {contact.email}
                      </a>
                    </dd>
                  </div>
                </div>
              ) : null}

              {address ? (
                <div className="flex items-start gap-4 py-4 first:pt-0">
                  <DetailIcon name="address" />
                  <div className="min-w-0">
                    <dt className="eyebrow">{t("address")}</dt>
                    <dd className="mt-0.5">
                      <address className="not-italic whitespace-pre-line text-ink">{address}</address>
                      {mapUrl ? (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-underline mt-1 inline-block py-0.5 font-semibold text-accent hover:text-accent-700"
                        >
                          {t("directions")} →
                        </a>
                      ) : null}
                    </dd>
                  </div>
                </div>
              ) : null}

              {/* Opening hours: hidden entirely until provided (no "to be
                  confirmed" on the public site; the placeholder lives in Studio). */}
              {hours.length > 0 ? (
                <div className="flex items-start gap-4 py-4 first:pt-0">
                  <DetailIcon name="hours" />
                  <div className="min-w-0 flex-1">
                    <dt className="eyebrow">{t("hours")}</dt>
                    <dd className="mt-0.5">
                      <ul className="space-y-1">
                        {hours.map((h, i) => (
                          <li key={i} className="flex justify-between gap-6 text-ink">
                            <span className="capitalize">{h.day}</span>
                            <span>{h.closed ? "—" : `${h.opens ?? ""}–${h.closes ?? ""}`}</span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>
          </Reveal>

          {/* Right — Book a consultation (opens the Cal.com popup) with the
              clinic map embedded inside the same white card. No patient data
              is collected on-site. */}
          <Reveal delay={0.12} className="flex h-full flex-col px-7 pt-7 md:px-9 md:pt-9">
            <h2 className="text-[clamp(1.4rem,2.5vw,1.9rem)]">{t("bookTitle")}</h2>
            <p className="mt-4 text-slate-600">{t("bookBody")}</p>
            <BookButton className="btn btn-primary mt-6 self-start">{cta("book")}</BookButton>
            <div className="mt-8 flex-1 overflow-hidden rounded-lg border border-line">
              <iframe
                title={t("mapTitle")}
                src={mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-full min-h-[300px] w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
