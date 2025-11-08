'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const pathname = usePathname();

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/coding', label: 'Coding' },
    { path: '/fitness', label: 'Fitness' },
    { path: '/trading', label: 'Trading' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/projects', label: 'Projects' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 leading-none">
              Elite Performer
            </Link>
          </div>
          <nav className="flex space-x-1">
            {navLinks.map((link) => {
              // For dashboard, match exactly. For other routes, match if pathname starts with the link path
              const isActive =
                link.path === '/' ? pathname === '/' : (pathname?.startsWith(link.path) ?? false);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
