import { defineType, defineField } from "sanity";

// Singleton holding the home page's editorial copy and hero image. Previously
// these lived in messages/*.json; they are content (localised el/en/de), so the
// client can edit them in Studio. Only reusable UI strings (buttons, aria/form
// labels) remain in messages. The hero image uses a hotspot so the editor sets
// the focal point for the cover-crop (no hard-coded object-position in code).
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "procedures", title: "Procedures section" },
    { name: "about", title: "About section" },
    { name: "reviews", title: "Reviews section" },
    { name: "cta", title: "Closing CTA" },
  ],
  fields: [
    // ── Hero ──
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      description:
        "Set the hotspot to the focal point — the hero is cropped to cover and centred on it (no object-position in code).",
    }),
    defineField({
      name: "heroEyebrow",
      title: "Hero eyebrow",
      type: "localeString",
      group: "hero",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero heading (H1)",
      type: "localeString",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroLead",
      title: "Hero lead paragraph",
      type: "localeText",
      group: "hero",
    }),
    defineField({
      name: "trustBadges",
      title: "Trust badges",
      type: "array",
      of: [{ type: "localeString" }],
      group: "hero",
      description:
        "Short trust signals under the hero (e.g. training, field, location). Keep verifiable — no invented claims.",
    }),

    // ── Procedures section ──
    defineField({
      name: "proceduresTitle",
      title: "Section title",
      type: "localeString",
      group: "procedures",
    }),
    defineField({
      name: "proceduresIntro",
      title: "Section intro",
      type: "localeText",
      group: "procedures",
    }),
    defineField({
      name: "proceduresCtaLabel",
      title: "CTA label (to procedures)",
      type: "localeString",
      group: "procedures",
    }),

    // ── About section ──
    defineField({
      name: "aboutEyebrow",
      title: "Eyebrow",
      type: "localeString",
      group: "about",
    }),
    defineField({
      name: "aboutCtaLabel",
      title: "CTA label (to doctor profile)",
      type: "localeString",
      group: "about",
    }),

    // ── Reviews section ──
    defineField({
      name: "reviewsEyebrow",
      title: "Eyebrow",
      type: "localeString",
      group: "reviews",
    }),
    defineField({
      name: "reviewsTitle",
      title: "Section title",
      type: "localeString",
      group: "reviews",
    }),

    // ── Closing CTA ──
    defineField({
      name: "closingCtaTitle",
      title: "Title",
      type: "localeString",
      group: "cta",
    }),
    defineField({
      name: "closingCtaBody",
      title: "Body",
      type: "localeText",
      group: "cta",
    }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
