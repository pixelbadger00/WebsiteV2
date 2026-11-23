import { defineType, defineField } from "sanity";

// Standalone FAQ entry. Each question/answer is its own document so editors can
// add, edit and reorder them individually in the Studio (see src/sanity/structure.ts
// → "Συχνές Ερωτήσεις"). The live /faq page renders these, ordered by `order`.
// (Procedures keep their own embedded `faqItem` array for per-procedure FAQs.)
export const faq = defineType({
  name: "faq",
  title: "FAQ question",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "localeBlockContent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category (optional)",
      type: "string",
      description:
        "Optional grouping. When set on every question the /faq page groups them; otherwise they show as one ordered list.",
      options: {
        list: [
          { title: "General", value: "general" },
          { title: "Procedures", value: "procedures" },
          { title: "Recovery", value: "recovery" },
          { title: "Travel & Cyprus", value: "travel" },
        ],
      },
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Sort order on the FAQ page (lower numbers first).",
    }),
  ],
  orderings: [
    {
      title: "Manual order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { order: "order", el: "question.el", en: "question.en", category: "category" },
    prepare({ order, el, en, category }) {
      const n = typeof order === "number" ? `${order}. ` : "";
      return {
        title: `${n}${el || en || "(no question)"}`,
        subtitle: [en, category].filter(Boolean).join(" · "),
      };
    },
  },
});
