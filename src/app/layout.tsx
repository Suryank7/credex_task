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
  title: "StackAudit | Free AI Stack Audit",
  description:
    "Find hidden savings in your AI tool stack. Audit your team's spend on Cursor, Copilot, ChatGPT, Claude, and more — free, instant, and shareable.",
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
