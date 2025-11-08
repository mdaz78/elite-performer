'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/src/lib/use-theme';

export const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/coding', label: 'Coding' },
    { path: '/fitness', label: 'Fitness' },
    { path: '/trading', label: 'Trading' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/projects', label: 'Projects' },
  ];

  return (
    <header className="bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-text-primary dark:text-text-primary-dark leading-none transition-colors duration-200">
              Elite Performer
            </Link>
          </div>
          <nav className="flex items-center space-x-1">
            {navLinks.map((link) => {
              // For dashboard, match exactly. For other routes, match if pathname starts with the link path
              const isActive =
                link.path === '/' ? pathname === '/' : (pathname?.startsWith(link.path) ?? false);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-accent-blue dark:bg-accent-blue-dark text-white hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90'
                      : 'text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={toggleTheme}
              className="ml-4 p-2 rounded-md text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {session && (
              <div className="ml-4 flex items-center space-x-4 border-l border-border dark:border-border-dark pl-4">
                <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="px-3 py-2 rounded-md text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
