import { defineType, defineField } from "sanity";

// A patient review. Unlike pages, a testimonial is written once in one language
// by one patient, so it is NOT localized el/en/de — it carries a single
// `language` and is shown on that locale's pages.
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "author", title: "Author", type: "string" }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: {
        list: [
          { title: "Greek (el)", value: "el" },
          { title: "English (en)", value: "en" },
          { title: "German (de)", value: "de" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "procedureTag",
      title: "Procedure",
      type: "reference",
      to: [{ type: "procedure" }],
      description: "Optional — link to the related procedure.",
    }),
    defineField({
      name: "consentToDisplay",
      title: "Consent to display (named review)",
      type: "boolean",
      initialValue: false,
      description:
        "Confirm the patient is happy to be shown by name (open-questions #13).",
    }),
    defineField({ name: "order", title: "Order", type: "number" }),
  ],
  orderings: [
    { title: "Manual order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "author", subtitle: "language" } },
});
