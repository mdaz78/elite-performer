'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/src/lib/use-theme';
import { useState, useRef, useEffect } from 'react';
import {
  Trophy,
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  Code,
  FolderKanban,
  TrendingUp,
  User,
  ChevronDown,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';

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
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/habit-tracker', label: 'Habit Tracker', icon: Target },
  ];

  const learningLinks = [
    { path: '/coding', label: 'Coding', icon: Code },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/trading', label: 'Trading', icon: TrendingUp },
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
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-text-primary dark:text-text-primary-dark leading-none transition-colors duration-200">
              <Trophy className="w-6 h-6 text-accent-blue dark:text-accent-blue-dark" />
              <span>Elite Performer</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-1">
            {navLinks.map((link) => {
              // For dashboard, match exactly. For other routes, match if pathname starts with the link path
              const isActive =
                link.path === '/' ? pathname === '/' : (pathname?.startsWith(link.path) ?? false);
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-accent-blue dark:bg-accent-blue-dark text-white hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90'
                      : 'text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="relative" ref={learningDropdownRef}>
              <button
                onClick={() => setIsLearningDropdownOpen(!isLearningDropdownOpen)}
                className="px-3 py-2 rounded-md text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark transition-colors duration-200 flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Learning</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isLearningDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isLearningDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark z-50">
                  <div className="py-1">
                    {learningLinks.map((link) => {
                      const isActive = pathname?.startsWith(link.path) ?? false;
                      const IconComponent = link.icon;
                      return (
                        <Link
                          key={link.path}
                          href={link.path}
                          onClick={() => setIsLearningDropdownOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 ${
                            isActive
                              ? 'bg-accent-blue dark:bg-accent-blue-dark text-white hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90'
                              : 'text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span>{link.label}</span>
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
                  <User className="w-4 h-4" />
                  <span>{session.user?.name || session.user?.email}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
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
                            <Sun className="w-5 h-5" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-5 h-5" />
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
                        <LogOut className="w-5 h-5" />
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
