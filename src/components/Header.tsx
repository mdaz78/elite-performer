'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/src/lib/use-theme';
import { useState, useRef, useEffect } from 'react';

export const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLearningDropdownOpen, setIsLearningDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const learningDropdownRef = useRef<HTMLDivElement>(null);

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/habit-tracker', label: 'Habit Tracker' },
  ];

  const learningLinks = [
    { path: '/coding', label: 'Coding' },
    { path: '/projects', label: 'Projects' },
    { path: '/trading', label: 'Trading' },
  ];

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (learningDropdownRef.current && !learningDropdownRef.current.contains(event.target as Node)) {
        setIsLearningDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isLearningDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isLearningDropdownOpen]);

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
            <div className="relative" ref={learningDropdownRef}>
              <button
                onClick={() => setIsLearningDropdownOpen(!isLearningDropdownOpen)}
                className="px-3 py-2 rounded-md text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Learning</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isLearningDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isLearningDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark z-50">
                  <div className="py-1">
                    {learningLinks.map((link) => {
                      const isActive = pathname?.startsWith(link.path) ?? false;
                      return (
                        <Link
                          key={link.path}
                          href={link.path}
                          onClick={() => setIsLearningDropdownOpen(false)}
                          className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                            isActive
                              ? 'bg-accent-blue dark:bg-accent-blue-dark text-white hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90'
                              : 'text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark'
                          }`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {session && (
              <div className="ml-4 relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
                >
                  <span>{session.user?.name || session.user?.email}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-text-secondary dark:text-text-secondary-dark border-b border-border dark:border-border-dark">
                        {session.user?.name || session.user?.email}
                      </div>
                      <button
                        onClick={() => {
                          toggleTheme();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
                      >
                        {theme === 'dark' ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <span>Dark Mode</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/auth/login' });
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
