import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-start px-6 py-28">
      <p className="font-serif text-[clamp(3rem,8vw,5rem)] font-semibold text-slate-300">
        404
      </p>
      <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.25rem)]">{t("title")}</h1>
      <p className="mt-3 max-w-[48ch] text-slate-600">{t("body")}</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-700"
      >
        {t("home")}
      </Link>
    </section>
  );
}
