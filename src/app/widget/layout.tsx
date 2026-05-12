import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StackAudit Widget',
  robots: 'noindex',
};

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ margin: 0, padding: 0, background: 'transparent' }} className="antialiased">
        {children}
      </body>
    </html>
  );
}
