import { Header } from '@/src/components';
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
          <div className="min-h-screen bg-background dark:bg-background-dark transition-colors duration-200">
            <Header />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
