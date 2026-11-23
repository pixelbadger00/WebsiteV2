import { type StructureResolver } from "sanity/structure";

// Desk structure. The TOP group mirrors the public site header navigation
// exactly (in Greek, as the client reviews the Studio in Greek):
//   Επεμβάσεις · Βιογραφικό · Άρθρα · FAQ · Επικοινωνία
// Everything that is NOT in the public navbar (home, testimonials, legal,
// site settings, other pages) sits below a divider as editable content.
//
// Note: there is no standalone "Θεραπεία στην Κύπρο" page — that content is the
// body of the /services (Επεμβάσεις) page (src/.../services/page.tsx reads the
// `page.treatment-in-cyprus` doc). So it is edited INSIDE "Επεμβάσεις", not as
// its own top-level section.

// Page documents surfaced individually (nested or top-level) so they don't also
// appear in the "Άλλες σελίδες" catch-all. Both published and draft ids.
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
      // ── Επεμβάσεις (Procedures) ──
      // Page content (the /services page body) + the list of procedures.
      S.listItem()
        .title("Επεμβάσεις")
        .id("procedures")
        .child(
          S.list()
            .title("Επεμβάσεις")
            .items([
              S.listItem()
                .title("Περιεχόμενο σελίδας")
                .id("page.treatment-in-cyprus")
                .child(
                  S.document()
                    .schemaType("page")
                    .documentId("page.treatment-in-cyprus"),
                ),
              S.listItem()
                .title("Λίστα επεμβάσεων")
                .id("procedureList")
                .child(
                  S.documentTypeList("procedure")
                    .title("Επεμβάσεις")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
            ]),
        ),

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

      // ── Άρθρα (Blog) ──
      S.documentTypeListItem("post").title("Άρθρα"),

      // ── FAQ (Συχνές Ερωτήσεις) ──
      // Page settings (title + SEO + optional intro) + the editable questions.
      S.listItem()
        .title("FAQ")
        .id("faqSection")
        .child(
          S.list()
            .title("FAQ")
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

      // ── Site-wide content NOT in the public navbar ──
      S.listItem()
        .title("Αρχική σελίδα")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),

      S.documentTypeListItem("testimonial").title("Αξιολογήσεις"),

      S.documentTypeListItem("legalPage").title("Νομικές σελίδες"),

      S.listItem()
        .title("Μετεγχειρητικές Οδηγίες")
        .id("page.instructions")
        .child(S.document().schemaType("page").documentId("page.instructions")),

      // Any other `page` document (none surfaced above).
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
