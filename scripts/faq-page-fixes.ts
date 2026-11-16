/**
 * Doctor feedback follow-up (2026-11-16):
 *  - Add the 3D-simulation (Crisalix) Q&A to the /faq PAGE (page.faq.body),
 *    el/en/de — each FAQ is one block: span[0] = question, span[1] = answer.
 *  - Remove the duplicate FAQ from the Rhinoplasty procedure (its page already
 *    shows the full 3D-simulation section).
 *  - Keep "FAQ" untranslated: page.faq.title.el / .de → "FAQ".
 * Idempotent (replaces the block with the fixed key). Non-prod. REVIEW: medical copy.
 *
 * Usage: node --env-file=.env.local --import tsx scripts/faq-page-fixes.ts
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

const BLOCK_KEY = "faq-3d-simulation";

const question = {
  el: "Τι είναι η τρισδιάστατη προσομοίωση;",
  en: "What is 3D simulation?",
  de: "Was ist die 3D-Simulation?",
};
const answer = {
  el: [
    "Η τρισδιάστατη προσομοίωση με το σύστημα Crisalix αποτελεί ένα χρήσιμο εργαλείο στην προεγχειρητική συμβουλευτική. Μέσα από μια ρεαλιστική τρισδιάστατη απεικόνιση του προσώπου σας, μπορούμε να εξετάσουμε πιθανές αλλαγές στο σχήμα της μύτης και τη σχέση τους με τα υπόλοιπα χαρακτηριστικά σας, από διαφορετικές οπτικές γωνίες.",
    "Η διαδικασία μάς βοηθά να συζητήσουμε συγκεκριμένα τις επιθυμίες σας, να αξιολογήσουμε τις δυνατότητες και τους ανατομικούς περιορισμούς και να διαμορφώσουμε έναν εξατομικευμένο χειρουργικό σχεδιασμό με ρεαλιστικές προσδοκίες.",
    "Η προσομοίωση μπορεί να πραγματοποιηθεί και στο πλαίσιο διαδικτυακής συμβουλευτικής (online consultation), με την αποστολή φωτογραφιών σας σύμφωνα με τις οδηγίες μας. Κατά τη συνεδρία, εξετάζουμε μαζί την απεικόνιση και συζητούμε τις προτεινόμενες αλλαγές και τα ερωτήματά σας.",
    "Η προσομοίωση είναι μέσο επικοινωνίας και σχεδιασμού και δεν αποτελεί εγγύηση του τελικού αποτελέσματος, το οποίο επηρεάζεται από την ανατομία, τη χειρουργική επέμβαση και τη διαδικασία επούλωσης. Η διαδικτυακή συμβουλευτική συμπληρώνει την αξιολόγηση, χωρίς να αντικαθιστά την απαραίτητη κλινική εξέταση πριν από το χειρουργείο.",
  ].join(" "),
  en: [
    "Three-dimensional simulation using the Crisalix system is a valuable tool in preoperative consultation. Through a realistic 3D representation of your face, we can explore potential changes to the shape of your nose and assess how these changes relate to your other facial features from different viewing angles.",
    "This process allows us to discuss your aesthetic goals in detail, evaluate the possibilities and anatomical limitations, and develop a personalised surgical plan based on realistic expectations.",
    "3D simulation is also available as part of an online consultation, allowing you to submit photographs according to our instructions. During the consultation, we review the simulation together, discuss the proposed changes, and address any questions you may have.",
    "It is important to understand that 3D simulation is a tool for communication and surgical planning, rather than a guarantee of the final surgical outcome. The actual results depend on individual anatomy, the surgical procedure, and the healing process.",
    "Online consultations complement the preoperative assessment but do not replace the essential in-person clinical examination required before surgery.",
  ].join(" "),
  de: [
    "Die dreidimensionale Simulation mit dem Crisalix-System ist ein wertvolles Instrument im Rahmen der präoperativen Beratung. Anhand einer realistischen 3D-Darstellung Ihres Gesichts können wir mögliche Veränderungen der Nasenform visualisieren und aus verschiedenen Blickwinkeln beurteilen, wie sich diese in die übrigen Gesichtszüge einfügen.",
    "Dieses Verfahren ermöglicht es uns, Ihre ästhetischen Wünsche ausführlich zu besprechen, die chirurgischen Möglichkeiten und anatomischen Grenzen zu beurteilen und auf dieser Grundlage eine individuelle Operationsplanung mit realistischen Erwartungen zu entwickeln.",
    "Die 3D-Simulation kann auch im Rahmen einer Online-Beratung durchgeführt werden. Hierfür übermitteln Sie uns Fotografien, die nach unseren Vorgaben angefertigt werden. Während der Online-Beratung betrachten wir die Simulation gemeinsam, besprechen die möglichen Veränderungen und beantworten Ihre Fragen.",
    "Es ist wichtig zu verstehen, dass die 3D-Simulation in erster Linie der Kommunikation und Operationsplanung dient und keine Garantie für das endgültige Operationsergebnis darstellt. Das tatsächliche Ergebnis hängt von den individuellen anatomischen Voraussetzungen, dem operativen Vorgehen sowie dem Heilungsverlauf ab.",
    "Die Online-Beratung stellt eine sinnvolle Ergänzung der präoperativen Beurteilung dar, ersetzt jedoch nicht die notwendige persönliche klinische Untersuchung vor dem chirurgischen Eingriff.",
  ].join(" "),
};

type Span = { _type: string; _key?: string; text?: string };
type Block = { _type: string; _key?: string; style?: string; children?: Span[]; markDefs?: unknown[] };

const faqBlock = (loc: "el" | "en" | "de"): Block => ({
  _type: "block",
  _key: BLOCK_KEY,
  style: "normal",
  markDefs: [],
  children: [
    { _type: "span", _key: `${BLOCK_KEY}-q`, text: question[loc] },
    { _type: "span", _key: `${BLOCK_KEY}-a`, text: answer[loc] },
  ],
});

async function query<T>(groq: string): Promise<T> {
  const res = await fetch(`${base}/data/query/${dataset}?query=${encodeURIComponent(groq)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return ((await res.json()) as { result: T }).result;
}

async function main(): Promise<void> {
  const faq = await query<{ body?: Record<string, Block[]> }>(`*[_id=="page.faq"][0]{body}`);
  const body = faq?.body ?? {};
  const set: Record<string, unknown> = {
    "title.el": "FAQ",
    "title.de": "FAQ",
  };
  for (const loc of ["el", "en", "de"] as const) {
    const existing = (Array.isArray(body[loc]) ? body[loc] : []).filter(
      (b) => b._key !== BLOCK_KEY,
    );
    set[`body.${loc}`] = [...existing, faqBlock(loc)];
  }

  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      mutations: [
        { patch: { id: "page.faq", set } },
        // Remove the duplicate FAQ from the Rhinoplasty procedure.
        { patch: { id: "procedure.rhinoplasty", set: { faqs: [] } } },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ 3D-simulation FAQ added to /faq page; Rhinoplasty FAQ cleared; title el/de = "FAQ".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
