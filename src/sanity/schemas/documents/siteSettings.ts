import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "general", title: "General", default: true },
    { name: "contact", title: "Contact & location" },
    { name: "seo", title: "Default SEO" },
    { name: "i18n", title: "Languages" },
  ],
  fields: [
    defineField({ name: "siteName", title: "Site name", type: "localeString", group: "general" }),
    defineField({
      name: "titlePrefix",
      title: "Doctor title (per locale)",
      type: "localeString",
      group: "general",
      description:
        'Shown before the doctor name per locale (e.g. "Δρ." / "Dr."). On German pages "Dr. med." is a protected title — leave the German value empty until confirmed (open-questions #7a). Never hard-coded in code.',
    }),
    defineField({ name: "tagline", title: "Tagline", type: "localeString", group: "general" }),

    defineField({
      name: "contact",
      title: "Contact",
      type: "object",
      group: "contact",
      fields: [
        defineField({ name: "phone", title: "Phone", type: "string" }),
        defineField({ name: "mobile", title: "Mobile", type: "string" }),
        defineField({ name: "whatsapp", title: "WhatsApp number (digits only)", type: "string" }),
        defineField({ name: "email", title: "Email", type: "string" }),
      ],
    }),
    defineField({ name: "address", title: "Address", type: "localeText", group: "contact" }),
    defineField({ name: "geo", title: "Map location", type: "geopoint", group: "contact" }),
    defineField({
      name: "mapImage",
      title: "Static map image",
      type: "image",
      group: "contact",
      description: "Static image linking to Maps (no embedded iframe on load).",
    }),
    defineField({ name: "mapUrl", title: "Map link (opens Maps)", type: "url", group: "contact" }),
    defineField({
      name: "openingHours",
      title: "Opening hours",
      type: "array",
      of: [{ type: "openingHours" }],
      group: "contact",
    }),
    defineField({
      name: "socials",
      title: "Social links",
      type: "array",
      of: [{ type: "socialLink" }],
      group: "contact",
    }),

    defineField({ name: "defaultSeo", title: "Default SEO", type: "seo", group: "seo" }),

    defineField({
      name: "germanEnabled",
      title: "German site enabled",
      type: "boolean",
      initialValue: false,
      group: "i18n",
      description:
        "Off until German copy exists. While off, /de pages are noindex, excluded from sitemap + hreflang, and DE is hidden in the language switcher (only the Impressum is live).",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
