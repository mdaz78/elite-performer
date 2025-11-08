'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center h-10 px-6 rounded font-semibold text-body-sm transition-all duration-[150ms] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-primary-500 dark:bg-primary-500 text-white hover:bg-primary-600 dark:hover:bg-primary-600 active:bg-primary-700 dark:active:bg-primary-700 shadow-sm hover:shadow focus:ring-primary-500 dark:focus:ring-primary-500',
    secondary: 'bg-transparent border-[1.5px] border-neutral-300 dark:border-neutral-200 text-neutral-900 dark:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-100 focus:ring-neutral-500 dark:focus:ring-neutral-500',
    ghost: 'bg-transparent text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-100 focus:ring-primary-500 dark:focus:ring-primary-500',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
