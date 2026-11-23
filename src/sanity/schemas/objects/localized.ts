import { defineType, defineField } from "sanity";

// Field-level localization: every localized value carries el / en / de.
// German (de) is included but may stay empty until German copy is produced
// (the migration leaves it empty and flags it for translation).
const LOCALES = [
  { name: "el", title: "Greek (el)" },
  { name: "en", title: "English (en)" },
  { name: "de", title: "German (de)" },
] as const;

export const localeString = defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: LOCALES.map((l) =>
    defineField({ name: l.name, title: l.title, type: "string" }),
  ),
});

export const localeText = defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: LOCALES.map((l) =>
    defineField({ name: l.name, title: l.title, type: "text", rows: 3 }),
  ),
});

export const localeBlockContent = defineType({
  name: "localeBlockContent",
  title: "Localized rich text",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: LOCALES.map((l) =>
    defineField({ name: l.name, title: l.title, type: "blockContent" }),
  ),
});

export const localeSlug = defineType({
  name: "localeSlug",
  title: "Web address (one per language)",
  type: "object",
  description:
    "The end of this page's web address, e.g. “…/rhinoplasty”. Use lowercase words joined by hyphens — no spaces, accents or capital letters. Tip: once a page is live, try not to change this, because any existing links to the old address would stop working.",
  options: { collapsible: true, collapsed: false },
  fields: LOCALES.map((l) =>
    defineField({ name: l.name, title: l.title, type: "slug" }),
  ),
});
