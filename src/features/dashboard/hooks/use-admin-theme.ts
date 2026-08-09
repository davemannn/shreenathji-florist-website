"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "admin-theme";
type AdminTheme = "light" | "dark";

/**
 * Deliberately independent of the site-wide next-themes ThemeProvider
 * (root layout.tsx locks that to defaultTheme="light", enableSystem=false
 * — dark mode was never built out for the customer-facing storefront, see
 * that provider's own doc comment). This toggles the `dark` class directly
 * on <html> instead, but only for as long as AdminShell is mounted (i.e.
 * only while a staff member is actually inside /admin) — the cleanup
 * removes it again, so a dark preference here can never leak onto a
 * customer's view of the storefront on the next navigation.
 *
 * Applied at the <html> level rather than scoped to a nested admin div on
 * purpose: dialogs, dropdowns, and the mobile nav sheet all portal to
 * document.body, outside AdminShell's own DOM subtree, so a scoped class
 * wouldn't reach them — Tailwind's `dark:` variant here is
 * `&:is(.dark *)` (globals.css), which only needs .dark somewhere up the
 * real DOM tree, not inside AdminShell's own JSX tree.
 */
export function useAdminTheme() {
  const [theme, setThemeState] = useState<AdminTheme>("light");

  // Hydration-safety pattern (localStorage only exists client-side), same
  // as dashboard-widget-grid.tsx / cart-view.tsx.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial: AdminTheme = stored === "dark" ? "dark" : "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  function toggleTheme() {
    setThemeState((prev) => {
      const next: AdminTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }

  return { theme, toggleTheme };
}
