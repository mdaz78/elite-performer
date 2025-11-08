'use client';

import { useTheme } from '@/src/lib/use-theme';
import {
  Activity,
  Bell,
  BookOpen,
  CheckSquare,
  ChevronDown,
  Clock,
  Code,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLearningDropdownOpen, setIsLearningDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const learningDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (
        learningDropdownRef.current &&
        !learningDropdownRef.current.contains(event.target as Node)
      ) {
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

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/habit-tracker', label: 'Habit Tracker', icon: Target },
    { path: '/fitness', label: 'Fitness', icon: Activity },
  ];

  const learningLinks = [
    { path: '/coding', label: 'Coding', icon: Code },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/trading', label: 'Trading', icon: TrendingUp },
  ];

  // Get user initial for avatar
  const getUserInitial = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="bg-neutral-0 dark:bg-neutral-100 border-b border-neutral-200 dark:border-neutral-200 transition-colors duration-[150ms]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 text-h4 font-bold text-neutral-800 dark:text-neutral-800 leading-none"
            >
              <div className="w-8 h-8 bg-primary-500 dark:bg-primary-500 rounded flex items-center justify-center">
                <span className="text-white text-body-sm font-bold">EP</span>
              </div>
              <span>Elite Performer</span>
            </Link>
          </div>

          {/* Navigation */}
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
                  className={`px-3 py-2 rounded text-body-sm font-medium transition-all duration-[150ms] flex items-center space-x-2 ${
                    isActive
                      ? 'text-primary-500 dark:text-primary-500'
                      : 'text-neutral-600 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-50'
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
                className="px-3 py-2 rounded text-body-sm font-medium text-neutral-600 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-50 transition-all duration-[150ms] flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Learning</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-[150ms] ${isLearningDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isLearningDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded shadow-lg bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 z-50">
                  <div className="py-1">
                    {learningLinks.map((link) => {
                      const isActive = pathname?.startsWith(link.path) ?? false;
                      const IconComponent = link.icon;
                      return (
                        <Link
                          key={link.path}
                          href={link.path}
                          onClick={() => setIsLearningDropdownOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-2 text-body-sm transition-all duration-[150ms] ${
                            isActive
                              ? 'bg-primary-500 dark:bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-600'
                              : 'text-neutral-600 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-50'
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

            {/* Right side utilities */}
            <div className="ml-4 flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded text-body-sm text-neutral-600 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-50 transition-all duration-[150ms]"
                aria-label="Toggle theme"
              >
                <Moon className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button
                className="p-2 rounded text-body-sm text-neutral-600 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-50 transition-all duration-[150ms]"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>

              {/* User Avatar */}
              {session && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-8 h-8 rounded-full bg-primary-500 dark:bg-primary-500 flex items-center justify-center text-white text-body-sm font-medium hover:bg-primary-600 dark:hover:bg-primary-600 transition-all duration-[150ms]"
                    aria-label="User menu"
                  >
                    {getUserInitial()}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded shadow-lg bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-body-sm text-neutral-600 dark:text-neutral-600 border-b border-neutral-200 dark:border-neutral-200">
                          {session.user?.name || session.user?.email}
                        </div>
                        <button
                          onClick={() => {
                            toggleTheme();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-body-sm text-neutral-600 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-50 transition-all duration-[150ms]"
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
                          className="w-full flex items-center space-x-3 px-4 py-2 text-body-sm text-neutral-600 dark:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-50 transition-all duration-[150ms]"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
