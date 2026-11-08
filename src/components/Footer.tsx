import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/config";

const SOCIAL_ICONS: Record<string, ReactNode> = {
  instagram: (
    <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .5 1.4.9.4.4.7.8.9 1.4.17.4.37 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.05 1.2-.25 1.8-.42 2.2a3.8 3.8 0 0 1-.9 1.4 3.8 3.8 0 0 1-1.4.9c-.4.17-1 .37-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.05-1.8-.25-2.2-.42a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.17-.4-.37-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.2.25-1.8.42-2.2.22-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.37 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-.9.04-1.4.2-1.7.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.12.3-.28.8-.32 1.7C3.8 8.5 3.8 8.9 3.8 12s0 3.5.07 4.7c.04.9.2 1.4.32 1.7.17.43.37.74.69 1.06.32.32.63.52 1.06.69.3.12.8.28 1.7.32 1.2.07 1.6.07 4.7.07s3.5 0 4.7-.07c.9-.04 1.4-.2 1.7-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.12-.3.28-.8.32-1.7.07-1.2.07-1.6.07-4.7s0-3.5-.07-4.7c-.04-.9-.2-1.4-.32-1.7a2.9 2.9 0 0 0-.69-1.06 2.9 2.9 0 0 0-1.06-.69c-.3-.12-.8-.28-1.7-.32C15.5 4 15.1 4 12 4Zm0 3.06A4.94 4.94 0 1 1 7.06 12 4.94 4.94 0 0 1 12 7.06Zm0 1.8A3.14 3.14 0 1 0 15.14 12 3.14 3.14 0 0 0 12 8.86Zm5.14-3.2a1.15 1.15 0 1 1-1.15 1.15 1.15 1.15 0 0 1 1.15-1.15Z" />
  ),
  facebook: (
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.25 10.44 22v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.9 3.78-3.9 1.1 0 2.24.19 2.24.19v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22C18.34 21.25 22 17.08 22 12.06Z" />
  ),
  linkedin: (
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  ),
};

export default async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="bg-ink text-white/80">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 pt-14 pb-7 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="mb-3 flex items-center gap-2.5 font-serif text-[1.05rem] font-semibold text-white">
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-lg bg-white/10"
            >
              {/* Logo is black on transparent; invert to white for the dark footer. */}
              <Image
                src="/brand/logo-mark.png"
                alt=""
                aria-hidden
                width={23}
                height={40}
                unoptimized
                className="h-6 w-auto object-contain invert"
              />
            </span>
            {t("Meta.siteName")}
          </div>
          <p className="max-w-[40ch] text-white/70">{t("Footer.inCyprus")}</p>
          <nav aria-label={t("Footer.follow")} className="mt-5 flex items-center gap-3">
            {CONTACT.socials.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="me noopener noreferrer"
                aria-label={social.label}
                className="grid size-9 place-items-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[18px]">
                  {SOCIAL_ICONS[social.platform]}
                </svg>
              </a>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="eyebrow-light mb-3.5">
            {t("Footer.clinic")}
          </h2>
          <address className="not-italic text-white/80">
            {CONTACT.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <a href={CONTACT.mapUrl} className="mt-2 inline-block text-white/80 hover:text-white">
            Map
          </a>
        </div>

        <div>
          <h2 className="eyebrow-light mb-3.5">
            {t("Footer.contact")}
          </h2>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} data-analytics-event="click_phone" className="block py-2 text-white/80 hover:text-white">
            {CONTACT.phone}
          </a>
          <a href={`tel:${CONTACT.mobile.replace(/\s/g, "")}`} data-analytics-event="click_phone" className="block py-2 text-white/80 hover:text-white">
            {CONTACT.mobile}
          </a>
          <a href={`mailto:${CONTACT.email}`} data-analytics-event="click_email" className="block py-2 break-all text-white/80 hover:text-white">
            {CONTACT.email}
          </a>
        </div>

        <div>
          <h2 className="eyebrow-light mb-3.5">
            {t("Footer.more")}
          </h2>
          <Link href="/services" className="block py-2 text-white/80 hover:text-white">
            {t("Nav.procedures")}
          </Link>
          <Link href="/blog" className="block py-2 text-white/80 hover:text-white">
            {t("Nav.blog")}
          </Link>
          <Link href="/faq" className="block py-2 text-white/80 hover:text-white">
            {t("Nav.faq")}
          </Link>
          <Link href="/contact" className="block py-2 text-white/80 hover:text-white">
            {t("Nav.contact")}
          </Link>
        </div>

        <div className="flex flex-wrap justify-between gap-2.5 border-t border-white/15 pt-4 text-[0.82rem] text-white/60 md:col-span-full">
          <span>© {new Date().getFullYear()} {t("Meta.siteName")}</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href="/privacy" className="inline-block py-1.5 hover:text-white">
              {t("Footer.privacy")}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/cookies" className="inline-block py-1.5 hover:text-white">
              {t("Footer.cookies")}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/imprint" className="inline-block py-1.5 hover:text-white">
              {t("Footer.imprint")}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
