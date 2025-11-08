'use client'

import { Fragment } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
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
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500 dark:focus:ring-red-400'
      : 'bg-accent-blue dark:bg-accent-blue-dark hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 focus:ring-accent-blue dark:focus:ring-accent-blue-dark';

  return (
    <Fragment>
      <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm transition-opacity z-40" />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-surface dark:bg-surface-dark text-left shadow-xl border border-border dark:border-border-dark transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-surface dark:bg-surface-dark px-4 pb-4 pt-5 sm:p-6 sm:pb-4 transition-colors duration-200">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-text-primary dark:text-text-primary-dark transition-colors duration-200">{title}</h3>
                  <div className="mt-2">
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">{message}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-background dark:bg-background-dark px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-border dark:border-border-dark transition-colors duration-200">
              <button
                type="button"
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto transition-colors duration-200 ${confirmButtonClass}`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-surface dark:bg-surface-dark px-3 py-2 text-sm font-semibold text-text-primary dark:text-text-primary-dark shadow-sm ring-1 ring-inset ring-border dark:ring-border-dark hover:bg-background dark:hover:bg-background-dark sm:mt-0 sm:w-auto transition-colors duration-200"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
