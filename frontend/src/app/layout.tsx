import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Xperience | AI-Powered Event Management Assistant',
  description:
    'Operational event intelligence platform transforming natural language updates into live dashboards, task schedules, and risk tracking.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-full flex flex-col bg-[#F5F0E6] text-[#202020] font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
