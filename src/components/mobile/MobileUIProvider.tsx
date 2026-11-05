"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type MobileUI = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

const Ctx = createContext<MobileUI | null>(null);

export function MobileUIProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock background scroll while the menu is open.
  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  return <Ctx.Provider value={{ menuOpen, setMenuOpen }}>{children}</Ctx.Provider>;
}

export function useMobileUI(): MobileUI {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return { menuOpen: false, setMenuOpen: () => {} };
  }
  return ctx;
}
