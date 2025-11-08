'use client';

import { useTheme } from '@/src/lib/use-theme';
import {
  Activity,
  BookOpen,
  CheckSquare,
  ChevronDown,
  Code,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  Target,
  TrendingUp,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileLearningOpen, setIsMobileLearningOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileLearningOpen(false);
  }, [pathname]);

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
    <header className="sticky top-0 z-[100] bg-neutral-0 dark:bg-neutral-100 border-b border-neutral-200 dark:border-neutral-200 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-[18px] font-bold">EP</span>
              </div>
              <span className="text-[20px] font-bold text-neutral-800 dark:text-neutral-900 hidden sm:block">Elite Performer</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              // For dashboard, match exactly. For other routes, match if pathname starts with the link path
              const isActive =
                link.path === '/' ? pathname === '/' : (pathname?.startsWith(link.path) ?? false);
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-4 py-[10px] rounded-lg text-[14px] font-medium transition-all duration-[150ms] flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-500'
                      : 'text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100 hover:text-neutral-800 dark:hover:text-neutral-900'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="relative" ref={learningDropdownRef}>
              <button
                onClick={() => setIsLearningDropdownOpen(!isLearningDropdownOpen)}
                className="px-4 py-[10px] rounded-lg text-[14px] font-medium text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100 hover:text-neutral-800 dark:hover:text-neutral-900 transition-all duration-[150ms] flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Learning</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-[150ms] ${isLearningDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isLearningDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 z-50">
                  <div className="py-1">
                    {learningLinks.map((link) => {
                      const isActive = pathname?.startsWith(link.path) ?? false;
                      const IconComponent = link.icon;
                      return (
                        <Link
                          key={link.path}
                          href={link.path}
                          onClick={() => setIsLearningDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-[14px] transition-all duration-[150ms] ${
                            isActive
                              ? 'bg-primary-500 dark:bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-600'
                              : 'text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right side utilities */}
            <div className="ml-4 flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-lg text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100 hover:text-neutral-800 dark:hover:text-neutral-900 transition-all duration-[150ms] flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User Avatar */}
              {session && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-[14px] font-semibold hover:scale-105 transition-transform duration-[150ms] cursor-pointer"
                    aria-label="User menu"
                  >
                    {getUserInitial()}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 z-50">
                      <div className="py-2">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-200">
                          <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-900">
                            {session.user?.name || 'User'}
                          </p>
                          <p className="text-[13px] text-neutral-500 dark:text-neutral-500 mt-0.5">
                            {session.user?.email}
                          </p>
                        </div>

                        {/* Sign Out */}
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/auth/login' });
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-error-600 dark:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all duration-[150ms] mt-1"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Navigation Button & Utilities */}
          <div className="flex lg:hidden items-center gap-3">
            {/* Theme Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100 hover:text-neutral-800 dark:hover:text-neutral-900 transition-all duration-[150ms] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Avatar - Mobile */}
            {session && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-[14px] font-semibold hover:scale-105 transition-transform duration-[150ms] cursor-pointer"
                  aria-label="User menu"
                >
                  {getUserInitial()}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-neutral-0 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-200 z-50">
                    <div className="py-2">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-200">
                        <p className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-900">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-[13px] text-neutral-500 dark:text-neutral-500 mt-0.5">
                          {session.user?.email}
                        </p>
                      </div>

                      {/* Sign Out */}
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/auth/login' });
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-error-600 dark:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all duration-[150ms] mt-1"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-lg text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100 hover:text-neutral-800 dark:hover:text-neutral-900 transition-all duration-[150ms] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-200 py-4 animate-fadeIn">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/' ? pathname === '/' : (pathname?.startsWith(link.path) ?? false);
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-[150ms] flex items-center gap-3 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-500'
                        : 'text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100 hover:text-neutral-800 dark:hover:text-neutral-900'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Learning Section - Mobile */}
              <div className="mt-2 border-t border-neutral-200 dark:border-neutral-200 pt-3">
                <button
                  onClick={() => setIsMobileLearningOpen(!isMobileLearningOpen)}
                  className="w-full px-4 py-3 rounded-lg text-[15px] font-medium text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100 hover:text-neutral-800 dark:hover:text-neutral-900 transition-all duration-[150ms] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5" />
                    <span>Learning</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-[150ms] ${isMobileLearningOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isMobileLearningOpen && (
                  <div className="mt-1 ml-4 space-y-1 animate-fadeIn">
                    {learningLinks.map((link) => {
                      const isActive = pathname?.startsWith(link.path) ?? false;
                      const IconComponent = link.icon;
                      return (
                        <Link
                          key={link.path}
                          href={link.path}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-all duration-[150ms] ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-500'
                              : 'text-neutral-600 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-100'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
