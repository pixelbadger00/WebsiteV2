/**
 * Doctor feedback (requiredChanged.docx, 2026-11-16), item 26 — merge the two
 * septum blog articles into one titled "Διαφραγματοπλαστική".
 *  - Rewrites post.deviated-nasal-septum (EL title + body) with the doctor's
 *    supplied merged copy. Keeps the `deviated-nasal-septum` slug.
 *  - Deletes post.riniko ("Ρινικό Διάφραγμα"). A 301 is added in
 *    public/_redirects + docs/redirects.csv (/gr/blog/riniko → the merged post).
 *
 * EN is left as the existing deviated-nasal-septum content — the doctor only
 * supplied Greek merged copy; the EN article still needs his text. Non-prod.
 * REVIEW: medical copy.
 *
 * Usage: node --env-file=.env.local --import tsx scripts/merge-septum-article.ts
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dataset =
  process.env.SANITY_MIGRATION_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "";

if (dataset === "production" || dataset === "") {
  throw new Error(`Refusing: dataset "${dataset || "unset"}" must be non-production.`);
}
if (!token || !projectId) {
  throw new Error("SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_PROJECT_ID are required.");
}
const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type Block = {
  _type: "block"; _key: string; style: string; markDefs: never[];
  children: Span[]; listItem?: "bullet" | "number"; level?: number;
};
let n = 0;
const k = () => `mrg${n++}`;
const span = (text: string): Span => ({ _type: "span", _key: k(), text, marks: [] });
const p = (text: string): Block => ({ _type: "block", _key: k(), style: "normal", markDefs: [], children: [span(text)] });
const li = (text: string, kind: "bullet" | "number"): Block => ({ _type: "block", _key: k(), style: "normal", markDefs: [], listItem: kind, level: 1, children: [span(text)] });

const bodyEl: Block[] = [
  p("Η σκολίωση του ρινικού διαφράγματος οδηγεί σε μονόπλευρη ή ακόμη και αμφοτερόπλευρη δυσχέρεια της ρινικής αναπνοής. Η επέμβαση διαφραγματοπλαστικής γίνεται για καθαρά λειτουργικούς λόγους και με σκοπό τη βελτίωση της ρινικής αναπνοής και της ποιότητας ζωής του ασθενούς."),
  li("Χρόνος διάρκειας της επέμβασης: 20–30 λεπτά", "bullet"),
  li("Ολική αναισθησία", "bullet"),
  li("Μετεγχειρητικός πόνος: ελάχιστος", "bullet"),
  li("Χρόνος ανάρρωσης: 7–10 μέρες", "bullet"),
  p("Η πλαστική του ρινικού διαφράγματος (ρινικό διάφραγμα) διενεργείται ως εξής:"),
  li("Προετοιμασία: Ο ασθενής υποβάλλεται σε προεγχειρητικές εξετάσεις και ενημερώνεται για τη διαδικασία.", "number"),
  li("Αναισθησία: Η επέμβαση πραγματοποιείται συνήθως με γενική αναισθησία.", "number"),
  li("Πρόσβαση: Ο χειρουργός εισάγει ένα λεπτό εργαλείο μέσω της μύτης, προκειμένου να αποκτήσει πρόσβαση στο διάφραγμα.", "number"),
  li("Διόρθωση: Ο χειρουργός αφαιρεί ή επανατοποθετεί τον ιστό του διαφράγματος για να αποκαταστήσει τη φυσιολογική του θέση. Μπορεί να αφαιρεθούν τυχόν υπερτροφικοί ιστοί.", "number"),
  li("Κλείσιμο: Μετά την ολοκλήρωση της επέμβασης, ο χειρουργός κλείνει τις τομές, συχνά με απορροφήσιμα ράμματα.", "number"),
  li("Ανάκτηση: Ο ασθενής παρακολουθείται για λίγες ώρες πριν επιστρέψει στο σπίτι, με οδηγίες για τη μετεγχειρητική φροντίδα.", "number"),
];

const excerptEl =
  "Η επέμβαση διαφραγματοπλαστικής γίνεται για καθαρά λειτουργικούς λόγους, για τη βελτίωση της ρινικής αναπνοής και της ποιότητας ζωής του ασθενούς.";

async function main(): Promise<void> {
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      mutations: [
        {
          patch: {
            id: "post.deviated-nasal-septum",
            set: { "title.el": "Διαφραγματοπλαστική", "excerpt.el": excerptEl, "body.el": bodyEl },
          },
        },
        { delete: { id: "post.riniko" } },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Merged septum article (EL) + deleted post.riniko in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
