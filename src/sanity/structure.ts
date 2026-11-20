import { type StructureResolver } from "sanity/structure";

// Desk structure: siteSettings as a singleton, then content lists.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.listItem()
        .title("Home page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      // The live /faq page renders from this `page` document (id "page.faq"),
      // NOT the `faq` document type. Surface it directly so it's editable
      // without hunting through the generic "Pages" list.
      S.listItem()
        .title("FAQ page")
        .id("page.faq")
        .child(S.document().schemaType("page").documentId("page.faq")),
      S.divider(),
      S.documentTypeListItem("procedure").title("Procedures"),
      S.documentTypeListItem("page").title("Pages"),
      S.documentTypeListItem("post").title("Blog posts"),
      S.documentTypeListItem("doctor").title("Doctor"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      // NOTE: the standalone `faq` document type is currently unused (the live
      // FAQ page uses "page.faq" above; procedures embed their own faqItems),
      // so it is intentionally not listed here — an empty "FAQs" item only
      // confused editors. Re-add `S.documentTypeListItem("faq")` if that type
      // is ever wired up.
      S.documentTypeListItem("legalPage").title("Legal pages"),
    ]);
