import { defineType, defineField } from "sanity";

export const doctor = defineType({
  name: "doctor",
  title: "Doctor",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "localeString" }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "shortBio", title: "Short bio", type: "localeText" }),
    defineField({ name: "bio", title: "Full biography", type: "localeBlockContent" }),
    defineField({
      name: "credentials",
      title: "Credentials",
      type: "array",
      of: [{ type: "localeString" }],
      description: "Qualifications, training, fellowships. Keep verifiable — no invented claims.",
    }),
    defineField({
      name: "memberships",
      title: "Memberships",
      type: "array",
      of: [{ type: "localeString" }],
    }),
    defineField({
      name: "timeline",
      title: "Training & career timeline",
      type: "array",
      description: "Confirmed milestones only (year + label). No unverified claims.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "year", title: "Year", type: "localeString" }),
            defineField({ name: "label", title: "Label", type: "localeString" }),
          ],
          preview: { select: { title: "year", subtitle: "label.en" } },
        },
      ],
    }),
    defineField({
      name: "registrationNumbers",
      title: "Medical registration number(s)",
      type: "array",
      of: [{ type: "string" }],
      description: "Cyprus / Germany registration numbers (for trust signals / JSON-LD).",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { select: { title: "name.el", subtitle: "name.en", media: "portrait" } },
});
