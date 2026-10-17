import type { Metadata, Viewport } from "next";
import { Baloo_2, Baloo_Thambi_2, Noto_Sans_Devanagari, Noto_Sans_Tamil, Nunito } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import { themeInitScript } from "@/components/ThemeProvider";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Confetti } from "@/components/Confetti";
import { Toaster } from "@/components/Toaster";
import { NightOwlWatcher } from "@/components/NightOwlWatcher";

// Fonts are self-hosted by Next.js. Script fonts are not preloaded: the browser
// only fetches them when Tamil/Devanagari text is on screen (unicode-range).
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const baloo = Baloo_2({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-baloo", display: "swap" });
const balooTa = Baloo_Thambi_2({ subsets: ["tamil"], weight: ["600", "700", "800"], variable: "--font-baloo-ta", display: "swap", preload: false });
const notoTa = Noto_Sans_Tamil({ subsets: ["tamil"], weight: ["400", "600", "700"], variable: "--font-noto-ta", display: "swap", preload: false });
const notoDeva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "600", "700"], variable: "--font-noto-deva", display: "swap", preload: false });

const fontVars = [nunito, baloo, balooTa, notoTa, notoDeva].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  ),
  title: { default: "Brain Arena - Warning: may cause sudden intelligence", template: "%s | Brain Arena" },
  description: "Brain Arena is a fun and funny brain-training website: Quick Math, Memory Match, Word Hunt, Reaction Time and Quiz Blitz, with Brainy the mascot, badges, ranks and a daily challenge. In English, Tamil and Hindi.",
  applicationName: "Brain Arena",
  keywords: ["brain games", "brain training", "memory game", "wordle", "reaction time", "quiz", "math game"],
  openGraph: {
    title: "Brain Arena 🧠⚡",
    description: "5 tiny brain games. 1 slightly confused mascot. Warning: may cause sudden intelligence.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1036" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVars}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <I18nProvider>
          <NavBar />
          <main className="mx-auto max-w-6xl px-3 pt-3 sm:px-4 sm:pt-6">{children}</main>
          <Footer />
          <Toaster />
          <Confetti />
          <NightOwlWatcher />
        </I18nProvider>
      </body>
    </html>
  );
}
