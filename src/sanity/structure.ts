import { type StructureResolver } from "sanity/structure";

// Desk structure. Section labels mirror the site header navigation (in Greek,
// as the client reviews the Studio in Greek): Επεμβάσεις, Βιογραφικό, Άρθρα,
// Συχνές Ερωτήσεις, Επικοινωνία. Each live page/section is surfaced exactly
// once — the old generic "Pages" list duplicated FAQ/Contact and mixed real
// pages with settings, which editors found confusing.

// Page documents that are surfaced individually below (so they don't also
// appear in the "Other pages" catch-all). Both published and draft ids.
const SURFACED_PAGE_IDS = [
  "page.faq",
  "page.contact",
  "page.treatment-in-cyprus",
  "page.instructions",
];
const SURFACED_PAGE_ID_SET = [
  ...SURFACED_PAGE_IDS,
  ...SURFACED_PAGE_IDS.map((id) => `drafts.${id}`),
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Περιεχόμενο")
    .items([
      // ── Αρχική (Home) ──
      S.listItem()
        .title("Αρχική σελίδα")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),

      // ── Επεμβάσεις (Procedures) ──
      S.documentTypeListItem("procedure").title("Επεμβάσεις"),

      // ── Βιογραφικό (About the doctor) ──
      S.listItem()
        .title("Βιογραφικό")
        .id("doctor")
        .child(
          S.documentList()
            .title("Βιογραφικό")
            .schemaType("doctor")
            .filter('_type == "doctor"'),
        ),

      // ── Θεραπεία στην Κύπρο (Treatment in Cyprus) ──
      S.listItem()
        .title("Θεραπεία στην Κύπρο")
        .id("page.treatment-in-cyprus")
        .child(
          S.document()
            .schemaType("page")
            .documentId("page.treatment-in-cyprus"),
        ),

      // ── Άρθρα (Blog) ──
      S.documentTypeListItem("post").title("Άρθρα"),

      // ── Συχνές Ερωτήσεις (FAQ) ──
      // Page settings (title + SEO + optional intro) and the individually
      // editable questions, grouped under one menu item.
      S.listItem()
        .title("Συχνές Ερωτήσεις (FAQ)")
        .id("faqSection")
        .child(
          S.list()
            .title("Συχνές Ερωτήσεις")
            .items([
              S.listItem()
                .title("Ρυθμίσεις σελίδας")
                .id("page.faq")
                .child(
                  S.document().schemaType("page").documentId("page.faq"),
                ),
              S.listItem()
                .title("Ερωτήσεις")
                .id("faqList")
                .child(
                  S.documentTypeList("faq")
                    .title("Ερωτήσεις")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
            ]),
        ),

      // ── Επικοινωνία (Contact) ──
      S.listItem()
        .title("Επικοινωνία")
        .id("page.contact")
        .child(S.document().schemaType("page").documentId("page.contact")),

      S.divider(),

      // ── Μετεγχειρητικές Οδηγίες (Post-op instructions) ──
      S.listItem()
        .title("Μετεγχειρητικές Οδηγίες")
        .id("page.instructions")
        .child(S.document().schemaType("page").documentId("page.instructions")),

      // ── Αξιολογήσεις (Testimonials) ──
      S.documentTypeListItem("testimonial").title("Αξιολογήσεις"),

      // ── Νομικές σελίδες (Legal) ──
      S.documentTypeListItem("legalPage").title("Νομικές σελίδες"),

      // ── Άλλες σελίδες (any other `page` document) ──
      S.listItem()
        .title("Άλλες σελίδες")
        .id("otherPages")
        .child(
          S.documentList()
            .title("Άλλες σελίδες")
            .schemaType("page")
            .filter('_type == "page" && !(_id in $ids)')
            .params({ ids: SURFACED_PAGE_ID_SET }),
        ),

      S.divider(),

      // ── Ρυθμίσεις (Site settings) ──
      S.listItem()
        .title("Ρυθμίσεις ιστότοπου")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
    ]);
