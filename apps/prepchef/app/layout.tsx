import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './globals.css';

const queryClient = new QueryClient();

export const metadata: Metadata = {
  title: 'PrepChef | CaterKing Platform',
  description: 'Operational surface for prep teams built on Supabase + Next.js',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
