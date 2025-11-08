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
  const isFlex = className.includes('flex')
  return (
    <div
      className={`bg-neutral-0 dark:bg-neutral-100 rounded-lg border border-neutral-200 dark:border-neutral-200 shadow transition-all duration-[150ms] ${onClick ? 'cursor-pointer hover:shadow-md dark:hover:shadow-dark-md hover:border-neutral-300 dark:hover:border-neutral-300' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-200 flex justify-between items-center">
          {title && <h3 className="text-h3 text-neutral-800 dark:text-neutral-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${isFlex ? 'flex flex-col flex-1 min-h-0' : ''}`}>{children}</div>
    </div>
  );
};
