import { Header, PageTransition } from '@/src/components';
import '@/src/index.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Elite Performer',
  description: '180-Day Transformation Tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-50 transition-colors duration-300">
            <Header />
            <PageTransition>{children}</PageTransition>
          </div>
        </Providers>
      </body>
    </html>
  );
}
