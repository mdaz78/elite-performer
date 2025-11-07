import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/coding', label: 'Coding' },
    { path: '/fitness', label: 'Fitness' },
    { path: '/trading', label: 'Trading' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/projects', label: 'Projects' },
    { path: '/review', label: 'Weekly Review' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900 leading-none">
              Elite Performer
            </Link>
          </div>
          <nav className="flex space-x-1">
            {navLinks.map((link) => {
              // For dashboard, match exactly. For other routes, match if pathname starts with the link path
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
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
