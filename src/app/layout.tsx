import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "StackAudit — The Mint for AI Tool Spend | Free AI Stack Audit",
  description:
    "Find hidden savings in your AI tool stack. Audit your team's spend on Cursor, Copilot, ChatGPT, Claude, and more — free, instant, and shareable.",
  keywords: [
    "AI tool audit",
    "AI spend optimization",
    "Cursor pricing",
    "Copilot cost",
    "ChatGPT savings",
    "Claude pricing",
    "AI infrastructure",
    "Credex",
  ],
  openGraph: {
    title: "StackAudit — Find Hidden Savings in Your AI Tool Stack",
    description:
      "Free audit tool for AI infrastructure spend. Discover overpaying seats, cheaper alternatives, and API optimizations.",
    type: "website",
    siteName: "StackAudit by Credex",
  },
  twitter: {
    card: "summary_large_image",
    title: "StackAudit — The Mint for AI Tool Spend",
    description: "Audit your AI tool stack for free. Find savings instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-grid-pattern bg-radial-glow">
        {children}
      </body>
    </html>
  );
}
