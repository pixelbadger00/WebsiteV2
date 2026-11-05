import { defineType, defineField } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "localeString",
      description: "Falls back to the page/document title when empty.",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "localeText",
    }),
    defineField({
      name: "ogImage",
      title: "Social share image (Open Graph)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "noIndex",
      title: "Hide this page from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
