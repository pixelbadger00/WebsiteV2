/**
 * Doctor feedback (requiredChanged.docx, 2026-11-16) — replace the doctor's full
 * biography (bio field) with the supplied CV, el/en/de, and tweak the EL short
 * bio ("(Γερμανία)", "Κύπρος" → "Κύπρο"). Non-prod, idempotent (createOrReplace
 * of the bio/shortBio fields via patch set). REVIEW: medical copy.
 *
 * Structure: narrative paragraphs → memberships (bullets) → "Clinical experience"
 * (h3 + bullets) → "Special expertise" (h3 + items). Memberships are kept inline
 * (faithful to the doctor's document); the structured memberships array is left
 * untouched.
 *
 * NOTE: the German CV in the source docx is TRUNCATED (it cuts off at
 * "…Operationen zur Behandlung von"). The final clause is completed here by
 * analogy with the EL/EN text and the DE memberships / expertise sections are
 * omitted pending the rest of the German bio from the doctor. DE stays gated.
 *
 * Usage: node --env-file=.env.local --import tsx scripts/rewrite-doctor-bio.ts
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
  _type: "block";
  _key: string;
  style: string;
  markDefs: never[];
  children: Span[];
  listItem?: "bullet";
  level?: number;
};

let n = 0;
const k = () => `bio${n++}`;
const span = (text: string, marks: string[] = []): Span => ({ _type: "span", _key: k(), text, marks });
const p = (text: string): Block => ({ _type: "block", _key: k(), style: "normal", markDefs: [], children: [span(text)] });
const h3 = (text: string): Block => ({ _type: "block", _key: k(), style: "h3", markDefs: [], children: [span(text)] });
const li = (text: string): Block => ({ _type: "block", _key: k(), style: "normal", markDefs: [], listItem: "bullet", level: 1, children: [span(text)] });
// Subheading + description in one paragraph (EN "Special Expertise").
const labelled = (label: string, rest: string): Block => ({
  _type: "block", _key: k(), style: "normal", markDefs: [],
  children: [span(label + " — ", ["strong"]), span(rest)],
});

const bioEl: Block[] = [
  p("Ο Δρ. Πάρις Παπακώστας, Ωτορινολαρυγγολόγος, Χειρουργός Κεφαλής-Τραχήλου, εξειδικευμένος στην Πλαστική Χειρουργική Προσώπου και ιδιαίτερα στη Ρινοπλαστική και Ρινοχειρουργική, γεννήθηκε στη Λευκωσία το 1981. Αποφοίτησε από την Ιατρική Σχολή του Πανεπιστημίου Πατρών το 2007 με βαθμό πτυχίου «Λίαν καλώς»."),
  p("Ειδικεύθηκε στην Ωτορινολαρυγγολογία και Χειρουργική Κεφαλής-Τραχήλου σε διαφορετικά νοσοκομεία της Γερμανίας ανάμεσα στα οποία το Πανεπιστημιακό Νοσοκομείο του Βερολίνου Charité, το Helios Hospital Berlin Buch (με τη μεγαλύτερη Ωτορινολαρυγγολογική Κλινική του Βερολίνου) και το Πανεπιστημιακό Νοσοκομείο του Βρανδεμβούργου. Κατά τη διάρκεια της ειδικότητας δίδαξε το μάθημα της Ωτορινολαρυγγολογίας στο Πανεπιστήμιο του Βερολίνου ως Κλινικός Εκπαιδευτής σε φοιτητές 4ου και 5ου έτους καθώς και στα πλαίσια του Problem Based Learning σε φοιτητές 2ου έτους."),
  p("Ολοκληρώνοντας την ειδικότητα το 2014 στο Βερολίνο, εργάστηκε στη συνέχεια ως επιμελητής στο Νοσοκομείο Helios Berlin Buch επί 3 έτη κατά τη διάρκεια των οποίων εξειδικεύτηκε στην Πλαστική Χειρουργική Προσώπου. Έλαβε πιστοποίηση για τον παραπάνω τίτλο εξειδίκευσης από τον Ιατρικό Σύλλογο Βρανδεμβούργου. Παράλληλα κατέχει διδακτορικό τίτλο από την Ιατρική Σχολή του Πανεπιστημίου Charité στο Βερολίνο με θέμα «Ποιότητα ζωής σε σχέση με τα αντικειμενικά νευροωτολογικά ευρήματα σε ασθενείς με ακουστικό νευρίνωμα»."),
  p("Κατά το τελευταίο έτος παραμονής του στη Γερμανία εργάστηκε ως Ανώτερος Επιμελητής («Oberarzt») στην Ωτορινολαρυγγολογική Κλινική της Ιατρικής Σχολής του Βρανδεμβούργου μέχρι και τον Ιούνιο του 2018. Στη συνέχεια, επέστρεψε στην Κύπρο και εντάχθηκε στο ιατρικό προσωπικό του Γενικού Νοσοκομείου Λάρνακας, όπου εργάστηκε ως Επιμελητής Ωτορινολαρυγγολόγος έως τον Αύγουστο του 2019."),
  p("Τον Σεπτέμβριο του 2019 ίδρυσε το ιδιωτικό του ιατρείο στη Λευκωσία, όπου δραστηριοποιείται έκτοτε ως ιδιώτης Ωτορινολαρυγγολόγος – Χειρουργός Κεφαλής και Τραχήλου. Είναι συμβεβλημένος ιατρός με το Γενικό Σύστημα Υγείας (ΓεΣΥ) της Κύπρου."),
  p("Για τη διενέργεια των χειρουργικών του επεμβάσεων συνεργάζεται με το The Surgery Center 3i, όπου πραγματοποιεί εξειδικευμένες επεμβάσεις ρινοχειρουργικής, συμπεριλαμβανομένης της λειτουργικής και αισθητικής ρινοπλαστικής, καθώς και της χειρουργικής αντιμετώπισης παθήσεων της ρινός και των παραρρινίων κόλπων."),
  p("Από το 2019 μέχρι και το 2025 εργάστηκε ως Επιστημονικός Συνεργάτης και Κλινικός Εκπαιδευτής του Ευρωπαϊκού Πανεπιστημίου Κύπρου, διδάσκοντας το μάθημα της Ωτορινολαρυγγολογίας."),
  p("Ο Δρ. Πάρις Παπακώστας έχει παραστεί ως ομιλητής σε πολυάριθμα επιστημονικά διεθνή συνέδρια, παρουσιάζοντας το κλινικό και ερευνητικό του έργο, ενώ είναι μέλος των παρακάτω επιστημονικών εταιρειών:"),
  li("Deutsche Gesellschaft für HNO-Heilkunde, Kopf- und Halschirurgie"),
  li("European Academy of Facial Plastic Surgery"),
  li("Berufsverband HNO Deutschland"),
  li("Κυπριακή Ωτορινολαρυγγολογική Εταιρεία"),
  li("Πανελλήνια Ωτορινολαρυγγολογική Εταιρεία"),
  li("Πανελλήνια Ρινολογική Εταιρεία"),
  h3("Κλινική εμπειρία & ενδιαφέροντα"),
  li("Αισθητική και επανορθωτική πλαστική χειρουργική προσώπου"),
  li("Διάγνωση και θεραπεία παθήσεων της ρινός και των παραρρινίων κόλπων"),
  h3("Special Expertise"),
  li("Πλαστική χειρουργική προσώπου (επανορθωτική και αισθητική) – Τίτλος Εξειδίκευσης από τον Ιατρικό Σύλλογο Βρανδεμβούργου, Γερμανία"),
  li("Ρινολογία (συντηρητική και χειρουργική θεραπεία παθήσεων ρινός και παραρρινίων κόλπων)"),
];

const bioEn: Block[] = [
  p("Dr. Paris Papakostas is an Otorhinolaryngologist and Head & Neck Surgeon, specializing in Facial Plastic Surgery, with particular expertise in Rhinoplasty and Rhinologic Surgery. He was born in Nicosia, Cyprus, in 1981."),
  p("He graduated from the Faculty of Medicine at the University of Patras in 2007 with a degree classification of “Very Good”."),
  h3("Medical Training and Professional Experience"),
  p("Dr. Papakostas completed his specialist training in Otorhinolaryngology and Head & Neck Surgery at several leading hospitals in Germany, including Charité – University Medicine Berlin, Helios Hospital Berlin-Buch (home to the largest ENT department in Berlin), and Brandenburg University Hospital."),
  p("During his specialist training, he was actively involved in undergraduate medical education at the University of Berlin, teaching Otorhinolaryngology to fourth- and fifth-year medical students as a Clinical Instructor. He also participated in Problem-Based Learning (PBL) teaching programs for second-year medical students."),
  p("After completing his specialist training in Berlin in 2014, he continued working as a Consultant ENT Surgeon at Helios Hospital Berlin-Buch for three years. During this period, he undertook further specialized training in Facial Plastic Surgery and subsequently obtained official certification in this subspecialty from the Brandenburg State Medical Association (Landesärztekammer Brandenburg), Germany."),
  p("He also holds a doctoral degree from the Faculty of Medicine at Charité – University Medicine Berlin, with a dissertation entitled: “Quality of Life in Relation to Objective Neuro-Otological Findings in Patients with Acoustic Neuroma.”"),
  p("During his final year in Germany, Dr. Papakostas served as a Senior Consultant (Oberarzt) in the Department of Otorhinolaryngology at Brandenburg University Hospital, a position he held until June 2018."),
  p("He subsequently returned to Cyprus and joined Larnaca General Hospital, where he worked as a Consultant ENT Surgeon until August 2019."),
  p("In September 2019, he established his own private medical practice in Nicosia, Cyprus, where he continues to practise as an independent ENT and Head & Neck Surgeon. He is a registered healthcare provider under Cyprus's General Healthcare System (GeSY)."),
  p("For his surgical procedures, Dr. Papakostas collaborates with The Surgery Center 3i, where he performs specialised rhinologic and nasal surgical procedures, including functional and aesthetic rhinoplasty."),
  p("From 2019 to 2025, he was an Academic Associate and Clinical Instructor at the European University Cyprus, where he taught Otorhinolaryngology to undergraduate medical students."),
  h3("Academic Activities and Scientific Memberships"),
  p("Dr. Papakostas has been an invited speaker and presenter at numerous international scientific conferences, where he has presented his clinical experience and research work. He is a member of the following professional and scientific societies:"),
  li("German Society of Otorhinolaryngology, Head and Neck Surgery (Deutsche Gesellschaft für HNO-Heilkunde, Kopf- und Halschirurgie)"),
  li("European Academy of Facial Plastic Surgery (EAFPS)"),
  li("German Professional Association of ENT Specialists (Berufsverband HNO Deutschland)"),
  li("Cyprus Society of Otorhinolaryngology"),
  li("Hellenic Society of Otorhinolaryngology – Head and Neck Surgery"),
  li("Hellenic Rhinologic Society"),
  h3("Clinical Experience and Areas of Interest"),
  li("Aesthetic and reconstructive facial plastic surgery"),
  li("Diagnosis and treatment of diseases affecting the nose and paranasal sinuses"),
  h3("Special Expertise"),
  labelled("Facial Plastic Surgery", "aesthetic and reconstructive facial plastic surgery, with an officially recognised subspecialty qualification awarded by the Brandenburg State Medical Association, Germany."),
  labelled("Rhinology and Rhinologic Surgery", "comprehensive diagnosis, medical management, and surgical treatment of conditions affecting the nose and paranasal sinuses."),
];

const bioDe: Block[] = [
  p("Dr. Paris Papakostas ist Facharzt für Hals-Nasen-Ohren-Heilkunde und Kopf-Hals-Chirurgie mit einer zusätzlichen Qualifikation im Bereich der plastischen und rekonstruktiven Gesichtschirurgie. Sein besonderer Schwerpunkt liegt auf der funktionellen und ästhetischen Rhinoplastik sowie der operativen Behandlung von Erkrankungen der Nase und der Nasennebenhöhlen."),
  p("Er wurde 1981 als griechischer Zypriot in Nikosia, Zypern, geboren."),
  p("Im Jahr 2007 schloss er sein Medizinstudium an der Medizinischen Fakultät der Universität Patras in Griechenland mit der Gesamtnote „Sehr gut“ ab."),
  h3("Facharztausbildung und beruflicher Werdegang"),
  p("Seine Facharztausbildung für Hals-Nasen-Ohren-Heilkunde und Kopf-Hals-Chirurgie absolvierte Dr. Papakostas an verschiedenen renommierten Kliniken in Deutschland, darunter die Charité – Universitätsmedizin Berlin, das Helios Klinikum Berlin-Buch mit der größten HNO-Klinik Berlins sowie das Universitätsklinikum Brandenburg."),
  p("Bereits während seiner Facharztausbildung engagierte er sich in der medizinischen Lehre. Als klinischer Dozent unterrichtete er Medizinstudierende des vierten und fünften Studienjahres im Fach Hals-Nasen-Ohren-Heilkunde. Darüber hinaus beteiligte er sich an der Ausbildung von Studierenden des zweiten Studienjahres im Rahmen des problemorientierten Lernens (Problem-Based Learning, PBL)."),
  p("Nach erfolgreichem Abschluss seiner Facharztausbildung im Jahr 2014 in Berlin war er weitere drei Jahre als Facharzt am Helios Klinikum Berlin-Buch tätig."),
  p("In dieser Zeit vertiefte er seine Kenntnisse und operativen Fähigkeiten auf dem Gebiet der plastischen und rekonstruktiven Gesichtschirurgie. Im Anschluss erwarb er die entsprechende Zusatzqualifikation „Plastische Operationen“, die von der Landesärztekammer Brandenburg anerkannt und zertifiziert wurde."),
  p("Darüber hinaus promovierte er an der Medizinischen Fakultät der Charité – Universitätsmedizin Berlin. Seine Dissertation befasste sich mit dem Thema: „Lebensqualität in Abhängigkeit von objektiven neurootologischen Befunden bei Patienten mit Akustikusneurinom.“"),
  p("Während seines letzten Jahres in Deutschland war Dr. Papakostas als Oberarzt an der Klinik für Hals-Nasen-Ohren-Heilkunde des Universitätsklinikums Brandenburg tätig. Diese Position bekleidete er bis Juni 2018."),
  p("Anschließend kehrte er nach Zypern zurück und nahm seine Tätigkeit als Facharzt für Hals-Nasen-Ohren-Heilkunde am Allgemeinen Krankenhaus Larnaka auf, wo er bis August 2019 beschäftigt war."),
  p("Im September 2019 gründete er seine eigene Facharztpraxis in Nikosia, wo er seither als niedergelassener Facharzt für Hals-Nasen-Ohren-Heilkunde und Kopf-Hals-Chirurgie tätig ist. Er ist als Vertragsarzt im Allgemeinen Gesundheitssystem Zyperns (GeSY) zugelassen."),
  // Source truncated at "…Operationen zur Behandlung von"; completed by analogy. REVIEW: medical copy.
  p("Für die Durchführung seiner operativen Eingriffe kooperiert Dr. Papakostas mit dem The Surgery Center 3i. Dort führt er spezialisierte rhinologische und nasenchirurgische Eingriffe durch, insbesondere funktionelle und ästhetische Rhinoplastiken sowie Operationen zur Behandlung von Erkrankungen der Nase und der Nasennebenhöhlen."),
];

const shortBioElNew =
  "Ωτορινολαρυγγολόγος με πιστοποιημένη εξειδίκευση στην πλαστική χειρουργική προσώπου (Γερμανία), με έμφαση στη ρινοπλαστική και τη ρινοχειρουργική. Εκπαιδευμένος σε κορυφαία πανεπιστημιακά νοσοκομεία της Γερμανίας, με ιδιωτικό ιατρείο στη Λευκωσία, Κύπρο.";
// CV subtitle / role line shown as the About-page lead under the name.
const shortBioEnNew =
  "Otorhinolaryngologist – Head & Neck Surgeon · Specialist in Facial Plastic Surgery, Rhinoplasty and Rhinologic Surgery.";
const shortBioDeNew =
  "Facharzt für Hals-Nasen-Ohren-Heilkunde und Kopf-Hals-Chirurgie · Zusatzqualifikation in Plastischen Operationen · Spezialisierung auf Rhinoplastik und Rhinologie.";

async function main(): Promise<void> {
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      mutations: [
        {
          patch: {
            id: "doctor.paris-papakostas",
            set: {
              "bio.el": bioEl,
              "bio.en": bioEn,
              "bio.de": bioDe,
              "shortBio.el": shortBioElNew,
              "shortBio.en": shortBioEnNew,
              "shortBio.de": shortBioDeNew,
            },
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
  console.log(`✓ Doctor bio rewritten (el/en/de) + EL short bio in "${dataset}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
