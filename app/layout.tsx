import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import {CookieBanner} from "@/components/ui/CookieBanner";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/config/themes";
import { ScrollResetOnReload } from "@/components/providers/ScrollResetOnReload";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ryomixed | Oficial Web",
    template: "%s | Ryomixed",
  },
  description:
    "Tu centro multimedia definitivo para la descarga de contenido sin marcas de agua.",
};

const themeInitScript = `
  try {
    var saved = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    var valid = ["dark", "light", "catpuccino", "algodon-de-azucar", "azul-violaceo-medianoche", "vibraciones-lofi", "manzana-mentolada", "rojo-carmesi", "resplandor-croma"];
    var themeToApply = valid.indexOf(saved) !== -1 ? saved : "${DEFAULT_THEME}";
    document.documentElement.setAttribute("data-theme", themeToApply);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "${DEFAULT_THEME}");
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
        <ThemeProvider>
          <ScrollToTop />
          <CookieBanner />
          <ScrollResetOnReload/>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}