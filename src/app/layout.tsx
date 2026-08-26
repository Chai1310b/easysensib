import type { Metadata } from 'next';
import { Instrument_Sans, Space_Grotesk } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { TopBar } from '@/components/TopBar';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'EasySensib',
  description: 'Suivi de mes sensibilisations et sessions',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page font-body text-ink">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TopBar />
          <main className="flex grow flex-col">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
