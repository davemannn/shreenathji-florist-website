"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// next-themes is a dependency pulled in by the shadcn `sonner` (toast)
// component, which reads the current theme via its `useTheme()` hook. Dark
// mode itself isn't built out yet (locked to light for now) — this provider
// exists so that hook resolves cleanly rather than being un-provided.
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
