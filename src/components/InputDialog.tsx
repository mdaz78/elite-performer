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
      <div className="fixed inset-0 bg-neutral-900/50 dark:bg-neutral-900/70 backdrop-blur-sm transition-opacity z-40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className="relative transform overflow-hidden rounded-lg bg-neutral-0 dark:bg-neutral-100 text-left shadow-xl border border-neutral-200 dark:border-neutral-200 transition-all duration-[150ms] sm:my-8 sm:w-full sm:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-neutral-0 dark:bg-neutral-100 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-h4 text-neutral-800 dark:text-neutral-800 mb-4">{title}</h3>
                  {message && (
                    <div className="mt-2 mb-4">
                      <p className="text-body-sm text-neutral-600 dark:text-neutral-600">{message}</p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="input-dialog" className="block text-body-sm font-medium text-neutral-600 dark:text-neutral-600 mb-2">
                      {inputLabel}
                    </label>
                    <input
                      ref={inputRef}
                      id="input-dialog"
                      type="text"
                      defaultValue={defaultValue}
                      placeholder={inputPlaceholder}
                      onKeyDown={handleKeyDown}
                      className="w-full h-11 px-4 py-3 bg-neutral-0 dark:bg-neutral-50 text-neutral-900 dark:text-neutral-900 border-[1.5px] border-neutral-300 dark:border-neutral-200 rounded focus:outline-none focus:ring-[3px] focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-[150ms] text-body"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-neutral-200 dark:border-neutral-200">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded h-10 px-6 bg-primary-500 dark:bg-primary-500 text-body-sm font-semibold text-white shadow-sm hover:bg-primary-600 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500 sm:ml-3 sm:w-auto transition-all duration-[150ms]"
                onClick={handleConfirm}
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded h-10 px-6 bg-transparent border-[1.5px] border-neutral-300 dark:border-neutral-200 text-body-sm font-semibold text-neutral-900 dark:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-100 sm:mt-0 sm:w-auto transition-all duration-[150ms]"
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
