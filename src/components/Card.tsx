'use client'

import { ReactNode, MouseEventHandler } from 'react'

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const Card = ({ children, className = '', title, action, onClick }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
