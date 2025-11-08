'use client'

import { Fragment } from 'react'
import { X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
  disabled?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  disabled = false,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const confirmButtonClass =
    variant === 'danger'
      ? disabled
        ? 'bg-error-500/50 dark:bg-error-500/50 cursor-not-allowed opacity-50'
        : 'bg-error-600 dark:bg-error-600 hover:bg-error-700 dark:hover:bg-error-700 focus:ring-error-500 dark:focus:ring-error-500'
      : disabled
      ? 'bg-primary-500/50 dark:bg-primary-500/50 cursor-not-allowed opacity-50'
      : 'bg-primary-500 dark:bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-600 focus:ring-primary-500 dark:focus:ring-primary-500';

  return (
    <Fragment>
      <div className="fixed inset-0 bg-neutral-900/50 dark:bg-neutral-900/70 backdrop-blur-sm transition-opacity z-40" />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-neutral-0 dark:bg-neutral-100 text-left shadow-xl border border-neutral-200 dark:border-neutral-200 transition-all duration-[150ms] sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-neutral-0 dark:bg-neutral-100 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-h4 text-neutral-800 dark:text-neutral-800">{title}</h3>
                  <div className="mt-2">
                    <p className="text-body-sm text-neutral-600 dark:text-neutral-600">{message}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-neutral-200 dark:border-neutral-200">
              <button
                type="button"
                className={`inline-flex w-full justify-center items-center h-10 px-6 rounded text-body-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto transition-all duration-[150ms] ${confirmButtonClass}`}
                onClick={onConfirm}
                disabled={disabled}
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center items-center space-x-2 h-10 px-6 rounded bg-transparent border-[1.5px] border-neutral-300 dark:border-neutral-200 text-body-sm font-semibold text-neutral-900 dark:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-100 sm:mt-0 sm:w-auto transition-all duration-[150ms]"
                onClick={onCancel}
              >
                <X className="w-4 h-4" />
                <span>{cancelLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
