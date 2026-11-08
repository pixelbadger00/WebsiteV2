import { defineType, defineField, defineArrayMember } from "sanity";

export const procedure = defineType({
  name: "procedure",
  title: "Procedure",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "beforeAfter", title: "Before / after" },
    { name: "faq", title: "FAQs" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "name", title: "Name", type: "localeString", group: "content" }),
    defineField({ name: "slug", title: "Slug", type: "localeSlug", group: "content" }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      group: "content",
      description: "Sort order in the procedures index.",
    }),
    defineField({ name: "summary", title: "Summary", type: "localeText", group: "content" }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true }, group: "content" }),
    defineField({ name: "body", title: "Body", type: "localeBlockContent", group: "content" }),
    defineField({
      name: "recoveryTime",
      title: "Recovery time",
      type: "localeString",
      group: "content",
      description: "Short note (e.g. “~1–2 weeks visible”). Honest, no guarantees.",
    }),

    defineField({
      name: "animations",
      title: "3D animations (video)",
      type: "array",
      group: "content",
      description:
        "Short, web-compressed MP4 clips (not the raw multi-hundred-MB exports). Each is rendered click-to-play with controls on the procedure page.",
      of: [
        defineArrayMember({
          type: "object",
          name: "animationItem",
          title: "Animation",
          fields: [
            { name: "title", title: "Title (optional)", type: "string" },
            {
              name: "video",
              title: "Video (MP4)",
              type: "file",
              options: { accept: "video/mp4" },
            },
            {
              name: "poster",
              title: "Poster",
              type: "image",
              options: { hotspot: true },
              description: "Still frame shown before the clip is played.",
            },
            {
              name: "credit",
              title: "Credit",
              type: "string",
              description:
                "Attribution for a third-party animation (e.g. “3D animation by 3DMedWorld”). Confirm usage rights before publishing.",
            },
          ],
          preview: { select: { title: "title", subtitle: "credit", media: "poster" } },
        }),
      ],
    }),

    defineField({
      name: "showBeforeAfter",
      title: "Show before/after gallery",
      type: "beforeAfterVisibility",
      group: "beforeAfter",
    }),
    defineField({
      name: "beforeAfter",
      title: "Before / after pairs",
      type: "array",
      of: [{ type: "beforeAfterPair" }],
      group: "beforeAfter",
      description:
        "Health data — only consented pairs. Never rendered on /de (no German toggle exists).",
    }),

    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [{ type: "faqItem" }],
      group: "faq",
    }),

    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { select: { title: "name.el", subtitle: "name.en", media: "heroImage" } },
});
