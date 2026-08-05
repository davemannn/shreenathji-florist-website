import type { Metadata } from "next";
import { Inter, Marcellus } from "next/font/google";
import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Marcellus: elegant serif matching Florial's native display/logo identity.
// Inter: clean, modern body/UI face — leaner 2-font system than the
// reference theme's 3-family setup (Open Sans body + Poppins buttons).
const marcellus = Marcellus({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${inter.variable} h-full antialiased`}
      // next-themes patches className/style on <html> after hydration to set
      // the resolved theme without a flash — expected to differ from the
      // server-rendered markup, so this warning is suppressed per their docs.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
