import { Inter, Noto_Sans_SC } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

import './globals.css';
import { cn } from '@/lib/utils';

import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
});

const notoSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-cn',
});

export const metadata: Metadata = {
  title: 'Emerald Flashcards',
  description:
    'Học từ vựng đa ngôn ngữ với thuật toán Spaced Repetition (FSRS).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, notoSC.variable, 'h-full antialiased')}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <NextTopLoader color="#10b981" shadow={false} showSpinner={false} />
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
