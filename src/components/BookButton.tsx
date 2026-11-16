"use client";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "@/i18n/navigation";

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

// "Book a consultation" trigger. With NEXT_PUBLIC_CAL_LINK set it opens the
// BookingWizard (the screening step) by dispatching an `open-booking` window
// event; the wizard then opens the correct Cal.com event type. Without the env
// var it falls back to a link to /contact. The passed `onClick` still runs
// (e.g. the mobile menu closes itself).
export default function BookButton({ children, onClick, ...props }: Props) {
  if (!CAL_LINK) {
    return (
      <Link
        href="/contact"
        {...(props as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e);
        window.dispatchEvent(new CustomEvent("open-booking"));
      }}
      {...props}
    >
      {children}
    </button>
  );
}
