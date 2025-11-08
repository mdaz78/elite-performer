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
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">{title}</h3>
                  {message && (
                    <div className="mt-2 mb-4">
                      <p className="text-sm text-gray-500">{message}</p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="input-dialog" className="block text-sm font-medium text-gray-700 mb-2">
                      {inputLabel}
                    </label>
                    <input
                      ref={inputRef}
                      id="input-dialog"
                      type="text"
                      defaultValue={defaultValue}
                      placeholder={inputPlaceholder}
                      onKeyDown={handleKeyDown}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:ml-3 sm:w-auto"
                onClick={handleConfirm}
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
