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
      className={`bg-surface dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark transition-colors duration-200 ${onClick ? 'cursor-pointer hover:border-border/60 dark:hover:border-border-dark/60' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-border dark:border-border-dark flex justify-between items-center transition-colors duration-200">
          {title && <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark transition-colors duration-200">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
