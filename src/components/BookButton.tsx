"use client";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

// "Book a consultation" trigger. With NEXT_PUBLIC_CAL_LINK set it carries a
// `data-cal-link` attribute, and the Cal.com embed (bootstrapped once in
// CalPopup) opens the booking modal on click via its own delegated click
// handler — no per-button JS here. Without the env var it falls back to a link
// to /contact.
export default function BookButton({ children, onClick, ...props }: Props) {
  if (!CAL_LINK) {
    return (
      <a
        href="/contact"
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      data-cal-link={CAL_LINK}
      data-cal-config='{"layout":"month_view"}'
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
