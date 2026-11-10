import type { Metadata, Viewport } from "next";
import { Amiri, DM_Sans, Newsreader } from "next/font/google";
import { StoreProvider } from "@/components/Store";
import { AppShell } from "@/components/AppShell";
import { ServiceWorker } from "@/components/ServiceWorker";
import { THEME_BOOT } from "@/lib/theme";
import "./globals.css";

// Polices hébergées avec l’application : aucune requête vers un service tiers.
const dmsans = DM_Sans({ subsets: ["latin", "latin-ext"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-dmsans", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin", "latin-ext"], weight: ["400"], variable: "--font-newsreader", display: "swap" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });

export const metadata: Metadata = {
  title: "Programme du rizq",
  description: "Un programme quotidien d’invocations authentiques et sourcées, relié à un objectif concret.",
  applicationName: "Programme du rizq",
  appleWebApp: { capable: true, title: "Rizq", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F2F4" },
    { media: "(prefers-color-scheme: dark)", color: "#150C12" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmsans.variable} ${newsreader.variable} ${amiri.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
