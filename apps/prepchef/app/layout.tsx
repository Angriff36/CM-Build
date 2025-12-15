import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrepChef | CaterKing Platform',
  description: 'Operational surface for prep teams built on Supabase + Next.js',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="m-0 p-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
