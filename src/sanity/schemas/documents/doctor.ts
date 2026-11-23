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
      description:
        "The “Training & career” milestones shown on the home page and the doctor's page. Add, edit or reorder entries here (year + label, per language). Confirmed milestones only — no unverified claims.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "year", title: "Year", type: "localeString" }),
            defineField({ name: "label", title: "Label", type: "localeString" }),
          ],
          // year/label are localized objects, so select each locale explicitly
          // and build a readable row title (otherwise rows render blank).
          preview: {
            select: { yEl: "year.el", yEn: "year.en", lEl: "label.el", lEn: "label.en" },
            prepare({ yEl, yEn, lEl, lEn }) {
              const year = yEl || yEn || "";
              const label = lEl || lEn || "(no label)";
              return { title: [year, label].filter(Boolean).join(" — "), subtitle: lEn };
            },
          },
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
