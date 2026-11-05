import { defineType, defineField } from "sanity";

/** A single FAQ entry, embedded in procedures (and the standalone faq doc). */
export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ item",
  type: "object",
  fields: [
    defineField({ name: "question", title: "Question", type: "localeString" }),
    defineField({ name: "answer", title: "Answer", type: "localeText" }),
  ],
  preview: {
    select: { title: "question.el", subtitle: "question.en" },
  },
});

/** Opening hours row. */
export const openingHours = defineType({
  name: "openingHours",
  title: "Opening hours",
  type: "object",
  fields: [
    defineField({
      name: "day",
      title: "Day",
      type: "string",
      options: {
        list: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
    }),
    defineField({ name: "opens", title: "Opens", type: "string", description: "e.g. 09:00" }),
    defineField({ name: "closes", title: "Closes", type: "string", description: "e.g. 17:00" }),
    defineField({ name: "closed", title: "Closed", type: "boolean", initialValue: false }),
  ],
  preview: { select: { title: "day", subtitle: "opens" } },
});

/** Social / external profile link (used for sameAs in JSON-LD). */
export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: {
        list: ["instagram", "facebook", "youtube", "linkedin", "tiktok", "other"],
      },
    }),
    defineField({ name: "url", title: "URL", type: "url" }),
  ],
  preview: { select: { title: "platform", subtitle: "url" } },
});

/**
 * Before/after pair for a procedure gallery. Patient photos are health data:
 * only use pairs with written patient consent. Never shown on /de (enforced by
 * `beforeAfterVisibility`, which has no German field).
 */
export const beforeAfterPair = defineType({
  name: "beforeAfterPair",
  title: "Before / after pair",
  type: "object",
  fields: [
    defineField({
      name: "before",
      title: "Before",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "after",
      title: "After",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "caption", title: "Caption", type: "localeString" }),
    defineField({
      name: "consentConfirmed",
      title: "Written patient consent confirmed for web use",
      type: "boolean",
      initialValue: false,
      validation: (rule) =>
        rule.custom((value) =>
          value === true
            ? true
            : "Before/after images may only be published with confirmed written patient consent.",
        ),
    }),
  ],
  preview: { select: { title: "caption.el", media: "after" } },
});

/**
 * Per-locale toggle for the before/after gallery. German is intentionally
 * absent: before/after images are prohibited in German medical advertising
 * (HWG §11), so the flag cannot be enabled for /de by construction.
 */
export const beforeAfterVisibility = defineType({
  name: "beforeAfterVisibility",
  title: "Show before/after gallery",
  type: "object",
  description:
    "German (/de) is excluded by law (HWG §11) — there is no German toggle.",
  options: { columns: 2 },
  fields: [
    defineField({ name: "el", title: "Greek (el)", type: "boolean", initialValue: false }),
    defineField({ name: "en", title: "English (en)", type: "boolean", initialValue: false }),
  ],
});
