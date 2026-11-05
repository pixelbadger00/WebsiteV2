/**
 * Treatment-in-Cyprus page intro + missing procedure summaries.
 *  - Create the "treatment-in-cyprus" page doc (title + slug + body intro).
 *  - Add summaries for Septoplasty, FESS, Laser reduction and Navigation
 *    (Rhinoplasty already has one), faithful to each body, with no banned
 *    "safe/painless/guaranteed/risk-free" wording.
 * Non-prod, idempotent (createOrReplace + set). REVIEW: copy / medical copy.
 *
 * Usage:  pnpm fill:treatment
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

let keyN = 0;
const key = () => `k${keyN++}`;
const para = (text: string) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});
const body = (...ps: string[]) => ps.map(para);

const text = {
  title: { el: "Θεραπεία στην Κύπρο", en: "Treatment in Cyprus", de: "Behandlung in Zypern" },
  bodyEn: body(
    "Dr Paris Papakostas provides nose and sinus surgery at a private clinic in Nicosia, drawing on specialist training in leading German teaching hospitals. Consultations and procedures take place in Greek, English or German.",
    "Patients travel to the clinic from across Cyprus, the United Kingdom and Germany. Every treatment begins with an in-person consultation, where your options, the expected recovery and the risks are explained in full, and your procedure and follow-up are planned around your visit.",
  ),
  bodyEl: body(
    "Ο Δρ Πάρις Παπακώστας προσφέρει χειρουργική μύτης και παραρρινίων σε ιδιωτικό ιατρείο στη Λευκωσία, αξιοποιώντας την εξειδικευμένη εκπαίδευσή του σε κορυφαία πανεπιστημιακά νοσοκομεία της Γερμανίας. Οι συμβουλευτικές επισκέψεις και οι επεμβάσεις γίνονται στα ελληνικά, αγγλικά ή γερμανικά.",
    "Ασθενείς επισκέπτονται το ιατρείο από όλη την Κύπρο, το Ηνωμένο Βασίλειο και τη Γερμανία. Κάθε θεραπεία ξεκινά με συμβουλευτική επίσκεψη, όπου εξηγούνται πλήρως οι επιλογές σας, ο αναμενόμενος χρόνος ανάρρωσης και οι κίνδυνοι, ενώ η επέμβαση και η παρακολούθηση προγραμματίζονται γύρω από την επίσκεψή σας.",
  ),
  bodyDe: body(
    "Dr Paris Papakostas bietet Nasen- und Nebenhöhlenchirurgie in einer Privatpraxis in Nikosia an und stützt sich dabei auf seine Facharztausbildung an führenden deutschen Universitätskliniken. Beratung und Eingriffe erfolgen auf Griechisch, Englisch oder Deutsch.",
    "Patientinnen und Patienten kommen aus ganz Zypern, dem Vereinigten Königreich und Deutschland. Jede Behandlung beginnt mit einer persönlichen Beratung, in der Ihre Möglichkeiten, die zu erwartende Erholung und die Risiken ausführlich erklärt werden; Eingriff und Nachsorge werden um Ihren Besuch herum geplant.",
  ),
};

// REVIEW: medical copy — faithful to each procedure body; no "safe/painless/…".
const summaries: Record<string, { el: string; en: string }> = {
  "procedure.septoplasty": {
    en: "A focused procedure to straighten a deviated nasal septum that blocks breathing, restoring clear nasal airflow and a better quality of life.",
    el: "Μια στοχευμένη επέμβαση για τη διόρθωση του σκολιωμένου ρινικού διαφράγματος που εμποδίζει την αναπνοή, αποκαθιστώντας την ελεύθερη ρινική ροή και καλύτερη ποιότητα ζωής.",
  },
  "procedure.functional-endoscopic-sinus-surgery-fess": {
    en: "A minimally invasive endoscopic procedure for the paranasal sinuses, using high-definition imaging to restore their natural drainage and ventilation with precision.",
    el: "Μια ελάχιστα επεμβατική ενδοσκοπική μέθοδος για τους παραρρίνιους κόλπους, με απεικόνιση υψηλής ανάλυσης που αποκαθιστά με ακρίβεια τη φυσική παροχέτευση και τον αερισμό τους.",
  },
  "procedure.laser-reduction-of-the-inferior-nasal-turbinates": {
    en: "A short laser procedure that reduces enlarged inferior turbinates to relieve persistent nasal congestion and improve breathing.",
    el: "Μια σύντομη επέμβαση με laser που μειώνει τις διογκωμένες κάτω ρινικές κόγχες, ανακουφίζοντας την επίμονη ρινική συμφόρηση και βελτιώνοντας την αναπνοή.",
  },
  "procedure.navigation-systems-in-functional-endoscopic-sinus-surgery": {
    en: "Image-guided navigation that works like GPS during sinus surgery, giving the surgeon real-time precision in complex and revision cases.",
    el: "Σύστημα πλοήγησης που λειτουργεί σαν GPS κατά τη χειρουργική των παραρρινίων, προσφέροντας στον χειρουργό ακρίβεια σε πραγματικό χρόνο σε σύνθετες και επαναληπτικές περιπτώσεις.",
  },
};

async function main(): Promise<void> {
  const slug = (current: string) => ({ _type: "slug", current });
  const mutations: unknown[] = [
    {
      createOrReplace: {
        _id: "page.treatment-in-cyprus",
        _type: "page",
        title: { _type: "localeString", ...text.title },
        slug: {
          _type: "localeSlug",
          el: slug("treatment-in-cyprus"),
          en: slug("treatment-in-cyprus"),
          de: slug("treatment-in-cyprus"),
        },
        body: {
          _type: "localeBlockContent",
          el: text.bodyEl,
          en: text.bodyEn,
          de: text.bodyDe,
        },
      },
    },
    ...Object.entries(summaries).map(([id, s]) => ({
      patch: { id, set: { summary: { _type: "localeText", el: s.el, en: s.en } } },
    })),
  ];

  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Treatment page intro + 4 procedure summaries written to "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
