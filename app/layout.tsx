import type { Metadata, Viewport } from "next";
import { Amiri, DM_Sans } from "next/font/google";
import { StoreProvider } from "@/components/Store";
import { AppShell } from "@/components/AppShell";
import { AccountProvider } from "@/components/Account";
import { ServiceWorker } from "@/components/ServiceWorker";
import { THEME_BOOT } from "@/lib/theme";
import "./globals.css";

// Polices hébergées avec l’application : aucune requête vers un service tiers.
const dmsans = DM_Sans({ subsets: ["latin", "latin-ext"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-dmsans", display: "swap" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });

export const metadata: Metadata = {
  title: "Sabab",
  description: "Un programme quotidien d’invocations authentiques et sourcées, relié à un objectif concret.",
  applicationName: "Sabab",
  appleWebApp: { capable: true, title: "Sabab", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F4F7" },
    { media: "(prefers-color-scheme: dark)", color: "#121014" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmsans.variable} ${amiri.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <StoreProvider>
          <AccountProvider>
            <AppShell>{children}</AppShell>
          </AccountProvider>
        </StoreProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
