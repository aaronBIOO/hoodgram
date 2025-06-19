import './globals.css';
import { Providers } from './providers'; 
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter-variable',
});

export const metadata: Metadata = {
  title: 'Hoodgram',
  description: 'A place to connect with real people',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-dark-1 text-light-1 min-h-screen font-inter`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}