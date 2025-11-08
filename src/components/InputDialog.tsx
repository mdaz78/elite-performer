'use client'

import { Fragment, useEffect, useRef } from 'react';

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const InputDialog = ({
  isOpen,
  title,
  message,
  inputLabel = 'Name',
  inputPlaceholder = 'Enter name...',
  defaultValue = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: InputDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const value = inputRef.current?.value.trim() || '';
    if (value) {
      onConfirm(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Fragment>
      <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 backdrop-blur-sm transition-opacity z-40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className="relative transform overflow-hidden rounded-lg bg-surface dark:bg-surface-dark text-left shadow-xl border border-border dark:border-border-dark transition-all sm:my-8 sm:w-full sm:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface dark:bg-surface-dark px-4 pb-4 pt-5 sm:p-6 sm:pb-4 transition-colors duration-200">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-base font-semibold leading-6 text-text-primary dark:text-text-primary-dark mb-4 transition-colors duration-200">{title}</h3>
                  {message && (
                    <div className="mt-2 mb-4">
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">{message}</p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="input-dialog" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2 transition-colors duration-200">
                      {inputLabel}
                    </label>
                    <input
                      ref={inputRef}
                      id="input-dialog"
                      type="text"
                      defaultValue={defaultValue}
                      placeholder={inputPlaceholder}
                      onKeyDown={handleKeyDown}
                      className="w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-blue dark:focus:ring-accent-blue-dark focus:border-accent-blue dark:focus:border-accent-blue-dark transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-background dark:bg-background-dark px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-border dark:border-border-dark transition-colors duration-200">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-accent-blue dark:bg-accent-blue-dark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 focus:outline-none focus:ring-2 focus:ring-accent-blue dark:focus:ring-accent-blue-dark sm:ml-3 sm:w-auto transition-colors duration-200"
                onClick={handleConfirm}
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
