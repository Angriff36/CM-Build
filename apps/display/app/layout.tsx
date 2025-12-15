import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { LayoutClient } from './layout-client';
import './globals.css';

export const metadata: Metadata = {
  title: 'Display | CaterKing Platform',
  description: 'Kitchen display system for CaterKing',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
