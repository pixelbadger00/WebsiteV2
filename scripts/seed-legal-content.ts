/**
 * Populate the Privacy Policy and Imprint legalPage singletons with full,
 * structured content in el / en / de. The Cookie Policy (legal.cookies) is
 * already complete and is NOT touched by this script.
 *
 * ⚠️ REVIEW: copy — all copy here is a DRAFT pending legal review before launch.
 * Medical / professional-registration lines are also marked REVIEW: medical copy.
 * Square-bracketed [...] passages are placeholders for client-supplied facts
 * (VAT number, medical-council registration number, liability insurer,
 * retention periods) and MUST be filled in or removed before go-live.
 *
 * Idempotent: stable _ids (legal.privacy / legal.imprint) via createOrReplace,
 * re-runnable. Writes ONLY to a non-production dataset (asserts dataset !==
 * "production") with the MIGRATION-ONLY write token.
 *
 * Usage:  pnpm seed:legal-content
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-02";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dataset =
  process.env.SANITY_MIGRATION_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "";

if (dataset === "production" || dataset === "") {
  throw new Error(
    `Refusing to seed: target dataset is "${dataset || "unset"}". Use a non-production dataset (e.g. development).`,
  );
}
if (!token) {
  throw new Error("SANITY_API_WRITE_TOKEN is required to seed (migration-only token).");
}
if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required to seed.");
}

const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;

type Loc = "el" | "en" | "de";
type Style = "normal" | "h2" | "h3" | "blockquote";
type List = "bullet" | "number" | undefined;

// A content node carries one line of copy per locale, plus its style / list.
type Node = {
  style?: Style;
  list?: List;
  el: string;
  en: string;
  de: string;
};

function p(el: string, en: string, de: string): Node {
  return { style: "normal", el, en, de };
}
function h2(el: string, en: string, de: string): Node {
  return { style: "h2", el, en, de };
}
function h3(el: string, en: string, de: string): Node {
  return { style: "h3", el, en, de };
}
function li(el: string, en: string, de: string): Node {
  return { style: "normal", list: "bullet", el, en, de };
}

// Build localeBlockContent from the node list (one array per locale).
function body(nodes: Node[]): Record<Loc, unknown[]> {
  const build = (locale: Loc) =>
    nodes.map((n, i) => {
      const block: Record<string, unknown> = {
        _type: "block",
        _key: `b${i}`,
        style: n.style ?? "normal",
        markDefs: [],
        children: [{ _type: "span", _key: `s${i}`, text: n[locale], marks: [] }],
      };
      if (n.list) {
        block.listItem = n.list;
        block.level = 1;
      }
      return block;
    });
  return { el: build("el"), en: build("en"), de: build("de") };
}

function slug(el: string, en: string, de: string): Record<string, unknown> {
  return {
    el: { _type: "slug", current: el },
    en: { _type: "slug", current: en },
    de: { _type: "slug", current: de },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY POLICY — REVIEW: copy (GDPR; data controller established in Cyprus)
// ─────────────────────────────────────────────────────────────────────────────
const privacyNodes: Node[] = [
  p(
    "Τελευταία ενημέρωση: 20 Νοεμβρίου 2026.",
    "Last updated: 20 November 2026.",
    "Zuletzt aktualisiert: 20. November 2026.",
  ),
  p(
    "Η παρούσα Πολιτική Απορρήτου εξηγεί πώς το ιατρείο του Δρ. Πάρι Παπακώστα («εμείς», «το ιατρείο») συλλέγει και επεξεργάζεται προσωπικά δεδομένα όταν επισκέπτεστε αυτόν τον ιστότοπο ή επικοινωνείτε μαζί μας μέσω αυτού. Παρακαλούμε διαβάστε την μαζί με την Πολιτική Cookies.",
    "This Privacy Policy explains how the clinic of Dr Paris Papakostas (“we”, “us”, “the clinic”) collects and processes personal data when you visit this website or contact us through it. Please read it together with our Cookie Policy.",
    "Diese Datenschutzerklärung erläutert, wie die Praxis von Dr. Paris Papakostas („wir“, „die Praxis“) personenbezogene Daten erhebt und verarbeitet, wenn Sie diese Website besuchen oder uns über sie kontaktieren. Bitte lesen Sie sie zusammen mit unserer Cookie-Richtlinie.",
  ),

  h2("Υπεύθυνος επεξεργασίας", "Who is responsible for your data", "Verantwortlicher"),
  p(
    "Υπεύθυνος επεξεργασίας είναι ο Δρ. Πάρις Παπακώστας, Λόρδου Βύρωνος 2, Γραφείο 001, 1096 Λευκωσία, Κύπρος. Μπορείτε να επικοινωνήσετε μαζί μας στο τηλέφωνο +357 22 730269 ή στο email dr.paris.papakostas@gmail.com.",
    "The data controller is Dr Paris Papakostas, Lordou Vyronos 2, Office 001, 1096 Nicosia, Cyprus. You can reach us by phone at +357 22 730269 or by email at dr.paris.papakostas@gmail.com.",
    "Verantwortlicher ist Dr. Paris Papakostas, Lordou Vyronos 2, Office 001, 1096 Nikosia, Zypern. Sie erreichen uns telefonisch unter +357 22 730269 oder per E-Mail an dr.paris.papakostas@gmail.com.",
  ),
  p(
    "[Νομική επωνυμία, αριθμός εγγραφής/ΦΠΑ του υπευθύνου και τυχόν υπεύθυνος προστασίας δεδομένων — προς επιβεβαίωση.]",
    "[Controller’s legal registration/VAT details and any data-protection contact — to be confirmed.]",
    "[Rechtliche Angaben zur Registrierung/USt-IdNr. des Verantwortlichen sowie ggf. Datenschutzkontakt — wird bestätigt.]",
  ),

  h2("Ποια δεδομένα συλλέγουμε", "What personal data we collect", "Welche personenbezogenen Daten wir erheben"),
  p(
    "Συλλέγουμε μόνο τα δεδομένα που επιλέγετε να μας δώσετε, καθώς και περιορισμένα τεχνικά δεδομένα που απαιτούνται για την ασφαλή λειτουργία του ιστότοπου. Μέσω αυτού του ιστότοπου δεν συλλέγουμε ιατρικό ιστορικό, δεδομένα υγείας ή άλλα ευαίσθητα δεδομένα.",
    "We only collect the data you choose to give us and a limited amount of technical data needed to run the site securely. We do not collect any medical history, health information or other sensitive data through this website.",
    "Wir erheben nur die Daten, die Sie uns freiwillig mitteilen, sowie begrenzte technische Daten, die für den sicheren Betrieb der Website erforderlich sind. Über diese Website erheben wir keine Krankengeschichte, Gesundheits- oder sonstige sensible Daten.",
  ),
  li(
    "Στοιχεία επικοινωνίας που παρέχετε — όταν χρησιμοποιείτε φόρμα επικοινωνίας ή μας στέλνετε email: όνομα, διεύθυνση email, τηλέφωνο (εφόσον το δώσετε) και το περιεχόμενο του μηνύματός σας.",
    "Contact details you provide — when you use a contact form or email us: your name, email address, phone number (if given) and the content of your message.",
    "Kontaktdaten, die Sie angeben — wenn Sie ein Kontaktformular nutzen oder uns eine E-Mail senden: Name, E-Mail-Adresse, Telefonnummer (sofern angegeben) und den Inhalt Ihrer Nachricht.",
  ),
  li(
    "Δεδομένα κράτησης — αν κλείσετε ραντεβού, ο πάροχος κρατήσεων Cal.com επεξεργάζεται τα στοιχεία που καταχωρείτε (π.χ. όνομα, email και την ώρα που επιλέγετε) για τη διευθέτηση του ραντεβού.",
    "Booking data — if you book an appointment, our booking provider Cal.com processes the details you enter (such as name, email and your chosen time) to arrange the appointment.",
    "Buchungsdaten — wenn Sie einen Termin buchen, verarbeitet unser Buchungsanbieter Cal.com die von Ihnen eingegebenen Angaben (z. B. Name, E-Mail und gewählte Uhrzeit), um den Termin zu vereinbaren.",
  ),
  li(
    "Τεχνικά δεδομένα — ο πάροχος φιλοξενίας και τα συστήματα ασφαλείας επεξεργάζονται αυτόματα περιορισμένα δεδομένα, όπως τη διεύθυνση IP και πληροφορίες του προγράμματος περιήγησης, για την παροχή και την ασφάλεια του ιστότοπου.",
    "Technical data — our hosting provider and security systems automatically process limited data such as your IP address and browser information to deliver the site and keep it secure.",
    "Technische Daten — unser Hosting-Anbieter und Sicherheitssysteme verarbeiten automatisch begrenzte Daten wie Ihre IP-Adresse und Browser-Informationen, um die Website bereitzustellen und abzusichern.",
  ),
  li(
    "Δεδομένα cookies και analytics — μόνο εφόσον συναινέσετε. Δείτε την Πολιτική Cookies για λεπτομέρειες.",
    "Cookies and analytics data — only if you consent. See our Cookie Policy for details.",
    "Cookie- und Analysedaten — nur mit Ihrer Einwilligung. Einzelheiten finden Sie in unserer Cookie-Richtlinie.",
  ),

  h2("Γιατί χρησιμοποιούμε τα δεδομένα σας και νομική βάση", "Why we use your data and the legal basis", "Zweck der Verarbeitung und Rechtsgrundlage"),
  p(
    "Επεξεργαζόμαστε τα προσωπικά σας δεδομένα για τους παρακάτω σκοπούς, με βάση τις ακόλουθες νομικές βάσεις του Γενικού Κανονισμού Προστασίας Δεδομένων (GDPR):",
    "We process your personal data for the following purposes, relying on the legal bases set out in the EU General Data Protection Regulation (GDPR):",
    "Wir verarbeiten Ihre personenbezogenen Daten zu den folgenden Zwecken auf Grundlage der nachstehenden Rechtsgrundlagen der EU-Datenschutz-Grundverordnung (DSGVO):",
  ),
  li(
    "Για να απαντήσουμε στα ερωτήματά σας και να διευθετήσουμε ραντεβού — με βάση τη λήψη μέτρων κατόπιν αιτήματός σας πριν τη σύναψη υπηρεσίας και το έννομο συμφέρον μας να σας απαντήσουμε (άρθρο 6 παρ. 1 στοιχ. β΄ και στ΄).",
    "To respond to your enquiries and arrange appointments — on the basis of taking steps at your request before entering into a service, and our legitimate interest in replying to you (Article 6(1)(b) and (f)).",
    "Um Ihre Anfragen zu beantworten und Termine zu vereinbaren — auf Grundlage vorvertraglicher Maßnahmen auf Ihre Anfrage hin sowie unseres berechtigten Interesses, Ihnen zu antworten (Art. 6 Abs. 1 lit. b und f).",
  ),
  li(
    "Για τη λειτουργία, την ασφάλεια και τη συντήρηση του ιστότοπου — με βάση το έννομο συμφέρον μας για έναν ασφαλή και λειτουργικό ιστότοπο (άρθρο 6 παρ. 1 στοιχ. στ΄).",
    "To operate, secure and maintain the website — on the basis of our legitimate interest in providing a safe, functioning site (Article 6(1)(f)).",
    "Zum Betrieb, zur Sicherheit und zur Wartung der Website — auf Grundlage unseres berechtigten Interesses an einer sicheren, funktionsfähigen Website (Art. 6 Abs. 1 lit. f).",
  ),
  li(
    "Για analytics και τυχόν marketing — μόνο με βάση τη συγκατάθεσή σας (άρθρο 6 παρ. 1 στοιχ. α΄), την οποία μπορείτε να ανακαλέσετε ανά πάσα στιγμή.",
    "For analytics and any marketing — only on the basis of your consent (Article 6(1)(a)), which you can withdraw at any time.",
    "Für Analyse und etwaiges Marketing — ausschließlich auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a), die Sie jederzeit widerrufen können.",
  ),

  h2("Με ποιους μοιραζόμαστε τα δεδομένα σας", "Who we share your data with", "An wen wir Ihre Daten weitergeben"),
  p(
    "Δεν πουλάμε τα προσωπικά σας δεδομένα. Τα κοινοποιούμε μόνο σε παρόχους υπηρεσιών που μας βοηθούν να λειτουργούμε το ιατρείο και τον ιστότοπο, και μόνο στον βαθμό που απαιτείται:",
    "We do not sell your personal data. We share it only with service providers who help us run the clinic and this website, and only as needed:",
    "Wir verkaufen Ihre personenbezogenen Daten nicht. Wir geben sie nur an Dienstleister weiter, die uns beim Betrieb der Praxis und dieser Website unterstützen, und nur im erforderlichen Umfang:",
  ),
  li("Cal.com — κράτηση ραντεβού.", "Cal.com — appointment booking.", "Cal.com — Terminbuchung."),
  li(
    "Google (Google Analytics 4, Google Tag Manager και Google Maps) — στατιστικά ιστότοπου και χάρτες, μόνο μετά τη συγκατάθεσή σας.",
    "Google (Google Analytics 4, Google Tag Manager and Google Maps) — website analytics and maps, only after you consent.",
    "Google (Google Analytics 4, Google Tag Manager und Google Maps) — Website-Statistik und Karten, nur nach Ihrer Einwilligung.",
  ),
  li(
    "Ο πάροχος φιλοξενίας του ιστότοπου (Netlify) — για τη φιλοξενία και παράδοση του ιστότοπου.",
    "Our website hosting provider (Netlify) — to host and deliver the site.",
    "Unser Hosting-Anbieter (Netlify) — zum Hosten und Ausliefern der Website.",
  ),
  li(
    "[Πάροχος email — για τη λήψη και απάντηση των μηνυμάτων σας· προς επιβεβαίωση.]",
    "[Email provider — to receive and respond to your messages; to be confirmed.]",
    "[E-Mail-Anbieter — zum Empfang und zur Beantwortung Ihrer Nachrichten; wird bestätigt.]",
  ),
  p(
    "Ορισμένοι από αυτούς τους παρόχους εδρεύουν εκτός του Ευρωπαϊκού Οικονομικού Χώρου, μεταξύ άλλων στις Ηνωμένες Πολιτείες. Στις περιπτώσεις αυτές, οι διαβιβάσεις προστατεύονται με κατάλληλες εγγυήσεις, όπως οι Τυποποιημένες Συμβατικές Ρήτρες της Ευρωπαϊκής Επιτροπής.",
    "Some of these providers are based outside the European Economic Area, including in the United States. Where that is the case, transfers are protected by appropriate safeguards such as the European Commission’s Standard Contractual Clauses.",
    "Einige dieser Anbieter haben ihren Sitz außerhalb des Europäischen Wirtschaftsraums, unter anderem in den USA. In diesen Fällen sind die Übermittlungen durch geeignete Garantien wie die Standardvertragsklauseln der Europäischen Kommission geschützt.",
  ),

  h2("Πόσο καιρό διατηρούμε τα δεδομένα σας", "How long we keep your data", "Wie lange wir Ihre Daten speichern"),
  p(
    "Διατηρούμε τα δεδομένα ερωτημάτων και κρατήσεων μόνο για όσο χρόνο απαιτείται για τη διεκπεραίωση του αιτήματός σας και για εύλογο διάστημα στη συνέχεια, και έπειτα τα διαγράφουμε ή τα ανωνυμοποιούμε. [Συγκεκριμένοι χρόνοι διατήρησης — προς επιβεβαίωση.] Τα δεδομένα analytics διατηρούνται για το διάστημα που περιγράφεται στην Πολιτική Cookies.",
    "We keep enquiry and booking data only for as long as needed to deal with your request and for a reasonable period afterwards, and then delete or anonymise it. [Specific retention periods to be confirmed.] Analytics data is retained for the period described in our Cookie Policy.",
    "Wir speichern Anfrage- und Buchungsdaten nur so lange, wie es zur Bearbeitung Ihres Anliegens erforderlich ist, sowie für einen angemessenen Zeitraum danach, und löschen oder anonymisieren sie anschließend. [Konkrete Speicherfristen — wird bestätigt.] Analysedaten werden für den in der Cookie-Richtlinie beschriebenen Zeitraum gespeichert.",
  ),

  h2("Τα δικαιώματά σας", "Your rights", "Ihre Rechte"),
  p(
    "Βάσει του GDPR έχετε δικαίωμα πρόσβασης στα προσωπικά σας δεδομένα, διόρθωσης ή διαγραφής τους, περιορισμού ή εναντίωσης στην επεξεργασία, φορητότητας των δεδομένων, καθώς και ανάκλησης οποιασδήποτε συγκατάθεσης ανά πάσα στιγμή. Για να ασκήσετε τα δικαιώματά σας, επικοινωνήστε μαζί μας με τα παραπάνω στοιχεία.",
    "Under the GDPR you have the right to access your personal data, to have it corrected or erased, to restrict or object to its processing, to data portability, and to withdraw any consent at any time. To exercise these rights, contact us using the details above.",
    "Nach der DSGVO haben Sie das Recht auf Auskunft über Ihre personenbezogenen Daten, auf Berichtigung oder Löschung, auf Einschränkung oder Widerspruch gegen die Verarbeitung, auf Datenübertragbarkeit sowie auf jederzeitigen Widerruf einer Einwilligung. Zur Ausübung dieser Rechte kontaktieren Sie uns bitte über die oben genannten Angaben.",
  ),
  p(
    "Αν θεωρείτε ότι δεν διαχειριστήκαμε σωστά τα δεδομένα σας, έχετε δικαίωμα υποβολής καταγγελίας σε εποπτική αρχή. Στην Κύπρο αυτή είναι το Γραφείο Επιτρόπου Προστασίας Δεδομένων Προσωπικού Χαρακτήρα (www.dataprotection.gov.cy). Αν βρίσκεστε σε άλλη χώρα της ΕΕ ή στο Ηνωμένο Βασίλειο, μπορείτε να απευθυνθείτε στην τοπική σας αρχή.",
    "If you believe we have not handled your data properly, you have the right to lodge a complaint with a supervisory authority. In Cyprus this is the Office of the Commissioner for Personal Data Protection (www.dataprotection.gov.cy). If you are in another EU country or the UK, you may contact your local authority.",
    "Wenn Sie der Ansicht sind, dass wir Ihre Daten nicht ordnungsgemäß verarbeitet haben, haben Sie das Recht, Beschwerde bei einer Aufsichtsbehörde einzulegen. In Zypern ist dies das Office of the Commissioner for Personal Data Protection (www.dataprotection.gov.cy). Wenn Sie sich in einem anderen EU-Land oder im Vereinigten Königreich befinden, können Sie sich an Ihre örtliche Behörde wenden.",
  ),

  h2("Ασφάλεια δεδομένων", "Data security", "Datensicherheit"),
  p(
    "Λαμβάνουμε κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των προσωπικών σας δεδομένων από απώλεια, κακή χρήση και μη εξουσιοδοτημένη πρόσβαση. Ο ιστότοπος παρέχεται μέσω κρυπτογραφημένης σύνδεσης (HTTPS).",
    "We take appropriate technical and organisational measures to protect your personal data against loss, misuse and unauthorised access. The site is served over an encrypted (HTTPS) connection.",
    "Wir treffen geeignete technische und organisatorische Maßnahmen, um Ihre personenbezogenen Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen. Die Website wird über eine verschlüsselte Verbindung (HTTPS) bereitgestellt.",
  ),

  h2("Παιδιά", "Children", "Kinder"),
  p(
    "Αυτός ο ιστότοπος δεν απευθύνεται σε παιδιά και δεν συλλέγουμε εν γνώσει μας προσωπικά τους δεδομένα μέσω αυτού.",
    "This website is not directed at children, and we do not knowingly collect their personal data through it.",
    "Diese Website richtet sich nicht an Kinder, und wir erheben über sie nicht wissentlich personenbezogene Daten von Kindern.",
  ),

  h2("Αλλαγές στην παρούσα πολιτική", "Changes to this policy", "Änderungen dieser Erklärung"),
  p(
    "Ενδέχεται να επικαιροποιούμε την παρούσα Πολιτική Απορρήτου κατά καιρούς. Η ημερομηνία «τελευταία ενημέρωση» παραπάνω δείχνει πότε άλλαξε τελευταία φορά.",
    "We may update this Privacy Policy from time to time. The “last updated” date above shows when it was last changed.",
    "Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Das Datum „zuletzt aktualisiert“ oben zeigt die letzte Änderung an.",
  ),

  h2("Επικοινωνία", "Contact", "Kontakt"),
  p(
    "Για οποιαδήποτε ερώτηση σχετικά με την παρούσα Πολιτική Απορρήτου ή τα προσωπικά σας δεδομένα, επικοινωνήστε με τον Δρ. Πάρι Παπακώστα στο dr.paris.papakostas@gmail.com ή στο +357 22 730269.",
    "For any questions about this Privacy Policy or your personal data, contact Dr Paris Papakostas at dr.paris.papakostas@gmail.com or +357 22 730269.",
    "Bei Fragen zu dieser Datenschutzerklärung oder Ihren personenbezogenen Daten kontaktieren Sie bitte Dr. Paris Papakostas unter dr.paris.papakostas@gmail.com oder +357 22 730269.",
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
// IMPRINT / IMPRESSUM — REVIEW: copy (+ REVIEW: medical copy on professional lines)
// Built to the structure a German Impressum (§5 DDG) expects, for a provider
// established in Cyprus. Bracketed items need client confirmation.
// ─────────────────────────────────────────────────────────────────────────────
const imprintNodes: Node[] = [
  p(
    "Η σελίδα αυτή παρέχει τις νομικές πληροφορίες για τον παρόντα ιστότοπο και το ιατρείο του Δρ. Πάρι Παπακώστα.",
    "This page provides the legal information for this website and the clinic of Dr Paris Papakostas.",
    "Diese Seite enthält die rechtlichen Angaben zu dieser Website und zur Praxis von Dr. Paris Papakostas.",
  ),

  h2("Πάροχος", "Service provider", "Diensteanbieter"),
  p(
    "Δρ. Πάρις Παπακώστας, Λόρδου Βύρωνος 2, Γραφείο 001, 1096 Λευκωσία, Κύπρος.",
    "Dr Paris Papakostas, Lordou Vyronos 2, Office 001, 1096 Nicosia, Cyprus.",
    "Dr. Paris Papakostas, Lordou Vyronos 2, Office 001, 1096 Nikosia, Zypern.",
  ),

  h2("Στοιχεία επικοινωνίας", "Contact", "Kontakt"),
  li("Τηλέφωνο: +357 22 730269", "Phone: +357 22 730269", "Telefon: +357 22 730269"),
  li("Κινητό: +357 99 623821", "Mobile: +357 99 623821", "Mobil: +357 99 623821"),
  li(
    "Email: dr.paris.papakostas@gmail.com",
    "Email: dr.paris.papakostas@gmail.com",
    "E-Mail: dr.paris.papakostas@gmail.com",
  ),

  h2(
    "Υπεύθυνος για το περιεχόμενο",
    "Responsible for the content of this website",
    "Verantwortlich für den Inhalt",
  ),
  p(
    "Δρ. Πάρις Παπακώστας, στην παραπάνω διεύθυνση.",
    "Dr Paris Papakostas, at the address above.",
    "Dr. Paris Papakostas, unter der oben genannten Anschrift.",
  ),

  // REVIEW: medical copy — professional title, awarding country, registration and
  // governing rules all require confirmation by the client before launch.
  h2("Επαγγελματικές πληροφορίες", "Professional information", "Berufsrechtliche Angaben"),
  p(
    "Επαγγελματικός τίτλος: Ιατρός, ειδικός Ωτορινολαρυγγολόγος (Ωτών, Ρινός, Λάρυγγος). [Χώρα απονομής τίτλου: προς επιβεβαίωση.]",
    "Professional title: Physician, specialist in Otorhinolaryngology (Ear, Nose and Throat). [Country where the title was awarded: to be confirmed.]",
    "Berufsbezeichnung: Arzt, Facharzt für Hals-Nasen-Ohren-Heilkunde. [Land der Verleihung der Berufsbezeichnung: wird bestätigt.]",
  ),
  li(
    "Αρμόδιος επαγγελματικός φορέας / εγγραφή: [Παγκύπριος Ιατρικός Σύλλογος / αριθμός εγγραφής — προς επιβεβαίωση.]",
    "Competent professional body / registration: [Cyprus Medical Association / registration number — to be confirmed.]",
    "Zuständige Berufskammer / Registrierung: [Cyprus Medical Association / Registernummer — wird bestätigt.]",
  ),
  li(
    "Ισχύοντες επαγγελματικοί κανόνες: η νομοθεσία και οι επαγγελματικοί κανόνες που διέπουν την άσκηση της ιατρικής στην Κύπρο. [Παραπομπή — προς επιβεβαίωση.]",
    "Applicable professional regulations: the laws and professional rules governing the practice of medicine in Cyprus. [Reference to be confirmed.]",
    "Geltende berufsrechtliche Regelungen: die Gesetze und Berufsregeln, die die Ausübung der Medizin in Zypern regeln. [Fundstelle — wird bestätigt.]",
  ),

  h2("ΦΠΑ / Φορολογικά στοιχεία", "VAT / tax", "Umsatzsteuer / Steuer"),
  p(
    "[Αριθμός εγγραφής ΦΠΑ ή δήλωση ότι το ιατρείο δεν υπόκειται σε ΦΠΑ — προς επιβεβαίωση.]",
    "[VAT identification number, or a statement that the clinic is not VAT-registered — to be confirmed.]",
    "[Umsatzsteuer-Identifikationsnummer oder Hinweis, dass die Praxis nicht umsatzsteuerpflichtig ist — wird bestätigt.]",
  ),

  h2(
    "Ασφάλιση επαγγελματικής ευθύνης",
    "Professional liability insurance",
    "Berufshaftpflichtversicherung",
  ),
  p(
    "[Επωνυμία και διεύθυνση του ασφαλιστή επαγγελματικής ευθύνης και γεωγραφική έκταση κάλυψης — προς επιβεβαίωση. Οι πληροφορίες αυτές απαιτούνται για τη γερμανική αγορά.]",
    "[Name and address of the professional liability insurer, and the geographic scope of cover — to be confirmed. This information is required for the German market.]",
    "[Name und Anschrift des Berufshaftpflichtversicherers sowie der räumliche Geltungsbereich des Versicherungsschutzes — wird bestätigt. Diese Angaben sind für den deutschen Markt erforderlich.]",
  ),

  h2("Επίλυση διαφορών", "Online dispute resolution", "Online-Streitbeilegung"),
  p(
    "Η Ευρωπαϊκή Επιτροπή παρέχει πλατφόρμα ηλεκτρονικής επίλυσης διαφορών (ΗΕΔ) στη διεύθυνση ec.europa.eu/consumers/odr. Δεν είμαστε υποχρεωμένοι ούτε πρόθυμοι να συμμετέχουμε σε διαδικασία επίλυσης διαφορών ενώπιον οργάνου καταναλωτικής διαιτησίας.",
    "The European Commission provides a platform for online dispute resolution (ODR) at ec.europa.eu/consumers/odr. We are neither obliged nor willing to take part in dispute-resolution proceedings before a consumer arbitration board.",
    "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) unter ec.europa.eu/consumers/odr bereit. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
  ),

  h2("Φιλοξενία", "Hosting", "Hosting"),
  p(
    "Ο ιστότοπος φιλοξενείται από τη Netlify.",
    "This website is hosted by Netlify.",
    "Diese Website wird von Netlify gehostet.",
  ),

  h2(
    "Ευθύνη για το περιεχόμενο και τους συνδέσμους",
    "Liability for content and links",
    "Haftung für Inhalte und Links",
  ),
  p(
    "Επιμελούμαστε το περιεχόμενο του ιστότοπου με προσοχή, ωστόσο δεν μπορούμε να εγγυηθούμε ότι είναι πάντοτε ακριβές, πλήρες ή επίκαιρο. Ο ιστότοπος ενδέχεται να περιέχει συνδέσμους προς εξωτερικές ιστοσελίδες, το περιεχόμενο των οποίων δεν ελέγχουμε και για τις οποίες δεν φέρουμε ευθύνη. Οι πληροφορίες του ιστότοπου είναι γενικές και δεν υποκαθιστούν προσωπική ιατρική συμβουλή.",
    "We prepare the content of this site with care, but we cannot guarantee that it is always accurate, complete or up to date. This website may contain links to external sites whose content we do not control and for which we accept no responsibility. The information on this site is general and does not replace a personal medical consultation.",
    "Wir erstellen die Inhalte dieser Website mit Sorgfalt, können jedoch nicht gewährleisten, dass sie stets richtig, vollständig oder aktuell sind. Diese Website kann Links zu externen Seiten enthalten, deren Inhalte wir nicht kontrollieren und für die wir keine Verantwortung übernehmen. Die Informationen auf dieser Website sind allgemeiner Art und ersetzen keine persönliche ärztliche Beratung.",
  ),
];

async function mutate(mutations: Record<string, unknown>[]): Promise<void> {
  const res = await fetch(`${base}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  }
}

const docs: Record<string, unknown>[] = [
  {
    _id: "legal.privacy",
    _type: "legalPage",
    kind: "privacy",
    title: { el: "Πολιτική Απορρήτου", en: "Privacy Policy", de: "Datenschutzerklärung" },
    slug: slug("privacy", "privacy", "datenschutz"),
    body: body(privacyNodes),
  },
  {
    _id: "legal.imprint",
    _type: "legalPage",
    kind: "imprint",
    title: { el: "Στοιχεία ιατρείου", en: "Imprint", de: "Impressum" },
    slug: slug("imprint", "imprint", "impressum"),
    body: body(imprintNodes),
  },
];

async function main(): Promise<void> {
  await mutate(docs.map((doc) => ({ createOrReplace: doc })));
  console.log(
    `✓ Seeded full Privacy + Imprint content into "${dataset}" (REVIEW: copy — pending legal review). Cookie Policy left untouched.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
