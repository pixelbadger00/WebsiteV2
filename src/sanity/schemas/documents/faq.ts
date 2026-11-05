import { defineType, defineField } from "sanity";

// Standalone FAQ entry for the FAQ page (procedures embed their own faqItems).
export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "localeString" }),
    defineField({ name: "answer", title: "Answer", type: "localeBlockContent" }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "General", value: "general" },
          { title: "Procedures", value: "procedures" },
          { title: "Recovery", value: "recovery" },
          { title: "Travel & Cyprus", value: "travel" },
        ],
      },
    }),
    defineField({ name: "order", title: "Order", type: "number" }),
  ],
  orderings: [
    { title: "Manual order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "question.el", subtitle: "category" } },
});
