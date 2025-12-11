import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import '@caterkingapp/ui/globals.css';

export const metadata: Metadata = {
  title: 'Admin CRM | CaterKing Platform',
  description: 'Admin interface for event and task management',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
