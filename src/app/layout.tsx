import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://stackaudit.dev'),
  title: "StackAudit | Free AI Stack Audit",
  description: "Find hidden savings in your AI tool stack. Audit your team's spend on Cursor, Copilot, ChatGPT, Claude, and more — free, instant, and shareable.",
  robots: "index, follow",
  openGraph: {
    title: "StackAudit | Free AI Stack Audit",
    description: "Find hidden savings in your AI tool stack.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "StackAudit | Free AI Stack Audit",
    description: "Find hidden savings in your AI tool stack.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
