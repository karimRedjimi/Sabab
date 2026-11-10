import type { Metadata, Viewport } from "next";
import { Amiri, Newsreader } from "next/font/google";
import { StoreProvider } from "@/components/Store";
import { AppShell } from "@/components/AppShell";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

// Polices hébergées avec l’application : aucune requête vers un service tiers.
const newsreader = Newsreader({ subsets: ["latin", "latin-ext"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-newsreader", display: "swap" });
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
    { media: "(prefers-color-scheme: light)", color: "#ECF0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1916" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${newsreader.variable} ${amiri.variable}`}>
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
