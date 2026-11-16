"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CONTACT } from "@/lib/config";

// Pre-booking screening step (doctor feedback, points 27 & 29). Any "Book"
// trigger dispatches an `open-booking` window event; this modal asks a couple of
// questions and then opens the correct Cal.com event type (each reason is its
// own event type with its own duration, so slots are already keyed to the
// reason — point 29). The final buttons carry `data-cal-link`, so the existing
// CalPopup bootstrap opens the Cal modal; no Cal logic is duplicated here.

const CAL_BASE = process.env.NEXT_PUBLIC_CAL_LINK;

// Online-consultation event type is not created yet. When it exists in Cal.com,
// put its slug here and the online branch books it directly instead of asking
// the patient to call.
const ONLINE_SLUG = "";

type Reason = { key: string; slug: string; min: number };
const REASONS: Reason[] = [
  { key: "reasonRhinoplasty", slug: "rhinoplasty", min: 30 },
  { key: "reasonBreathing", slug: "nasal-breathing-difficulty", min: 15 },
  { key: "reasonSinusitis", slug: "chronic-sinusitis", min: 15 },
  { key: "reasonOther", slug: "other-nose-sinus-condition", min: 15 },
];

type Step = "mode" | "gesy" | "reason" | "gesyBlock" | "call" | "onlineArrange";

// --- Presentational pieces (module scope so they aren't re-created per render) ---

// A non-booking option (advances a step).
function Choice({
  label,
  desc,
  onClick,
}: {
  label: string;
  desc?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-0.5 rounded-card border border-line bg-surface px-5 py-4 text-left transition-colors hover:border-accent hover:bg-accent-50"
    >
      <span className="font-medium text-ink">{label}</span>
      {desc ? <span className="text-[0.88rem] text-slate-600">{desc}</span> : null}
    </button>
  );
}

// A booking trigger: carries data-cal-link so CalPopup opens the Cal modal.
function BookOption({
  calLink,
  label,
  minutesLabel,
  onBook,
}: {
  calLink: string;
  label: string;
  minutesLabel?: string;
  onBook: () => void;
}) {
  return (
    <button
      type="button"
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
      onClick={onBook}
      className="flex w-full items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4 text-left transition-colors hover:border-accent hover:bg-accent-50"
    >
      <span className="font-medium text-ink">{label}</span>
      {minutesLabel ? (
        <span className="shrink-0 rounded-full bg-accent-50 px-2.5 py-1 text-[0.78rem] font-semibold text-accent">
          {minutesLabel}
        </span>
      ) : null}
    </button>
  );
}

function CallOut({
  title,
  body,
  callLabel,
  phone,
  telHref,
}: {
  title: string;
  body: string;
  callLabel: string;
  phone: string;
  telHref: string;
}) {
  return (
    <div className="rounded-card border border-accent/20 bg-accent-50 p-5">
      <p className="font-serif text-[1.05rem] font-semibold text-ink">{title}</p>
      <p className="mt-1.5 text-[0.92rem] text-slate-700">{body}</p>
      <a
        href={telHref}
        data-analytics-event="click_phone"
        className="btn btn-primary mt-4 inline-flex"
      >
        {callLabel} {phone}
      </a>
    </div>
  );
}

export default function BookingWizard() {
  const t = useTranslations("BookingWizard");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("mode");
  const panelRef = useRef<HTMLDivElement>(null);
  const phone = CONTACT.phone2 ?? CONTACT.phone;
  const telHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => {
      setStep("mode");
      setOpen(true);
    };
    window.addEventListener("open-booking", onOpen);
    return () => window.removeEventListener("open-booking", onOpen);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  if (!CAL_BASE || !open) {
    return null;
  }

  const calLink = (slug: string) => `${CAL_BASE}/${slug}`;
  const callLabel = t("call");

  const canBack = step !== "mode";
  const back = () => {
    if (step === "gesy" || step === "reason") {
      setStep("mode");
    } else if (step === "gesyBlock" || step === "onlineArrange") {
      setStep("gesy");
    } else if (step === "call") {
      setStep("reason");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={close}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-wizard-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-[32rem] overflow-y-auto rounded-t-[1.25rem] bg-surface p-6 shadow-[var(--shadow-lift)] outline-none sm:rounded-card sm:p-8"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">{t("title")}</p>
            <p className="text-[0.9rem] text-slate-600">{t("intro")}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="-m-2 grid size-10 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-porcelain hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {step === "mode" ? (
          <div className="flex flex-col gap-3">
            <h2 id="booking-wizard-title" className="text-[length:var(--text-h3)]">
              {t("modeTitle")}
            </h2>
            <Choice label={t("modeInPerson")} desc={t("modeInPersonDesc")} onClick={() => setStep("reason")} />
            <Choice label={t("modeOnline")} desc={t("modeOnlineDesc")} onClick={() => setStep("gesy")} />
          </div>
        ) : null}

        {step === "gesy" ? (
          <div className="flex flex-col gap-3">
            <h2 id="booking-wizard-title" className="text-[length:var(--text-h3)]">
              {t("gesyTitle")}
            </h2>
            <Choice label={t("gesyYes")} onClick={() => setStep("gesyBlock")} />
            <Choice
              label={t("gesyNo")}
              onClick={() => setStep(ONLINE_SLUG ? "reason" : "onlineArrange")}
            />
          </div>
        ) : null}

        {step === "gesyBlock" ? (
          <div className="flex flex-col gap-4">
            <CallOut
              title={t("gesyBlockTitle")}
              body={t("gesyBlockBody")}
              callLabel={callLabel}
              phone={phone}
              telHref={telHref}
            />
            <button type="button" onClick={() => setStep("reason")} className="btn btn-secondary">
              {t("bookInPerson")}
            </button>
          </div>
        ) : null}

        {step === "onlineArrange" ? (
          <CallOut
            title={t("onlineArrangeTitle")}
            body={t("onlineArrangeBody")}
            callLabel={callLabel}
            phone={phone}
            telHref={telHref}
          />
        ) : null}

        {step === "reason" ? (
          <div className="flex flex-col gap-3">
            <h2 id="booking-wizard-title" className="text-[length:var(--text-h3)]">
              {t("reasonTitle")}
            </h2>
            {REASONS.map((r) => (
              <BookOption
                key={r.slug}
                calLink={calLink(r.slug)}
                label={t(r.key)}
                minutesLabel={t("minutes", { n: r.min })}
                onBook={close}
              />
            ))}
            <Choice label={t("reasonNone")} onClick={() => setStep("call")} />
          </div>
        ) : null}

        {step === "call" ? (
          <CallOut
            title={t("callTitle")}
            body={t("callBody")}
            callLabel={callLabel}
            phone={phone}
            telHref={telHref}
          />
        ) : null}

        {canBack ? (
          <button
            type="button"
            onClick={back}
            className="mt-5 inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-slate-500 hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("back")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
