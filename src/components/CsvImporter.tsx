'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'

interface CsvImporterProps {
  onImport: (data: any[]) => Promise<void>;
  accept?: string;
  label?: string;
  className?: string;
}

export const CsvImporter = ({
  onImport,
  accept = '.csv',
  label = 'Import CSV',
  className = '',
}: CsvImporterProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          await onImport(results.data);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Import failed');
        } finally {
          setIsImporting(false);
        }
      },
      error: (error) => {
        setError(error.message);
        setIsImporting(false);
      },
    });
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id="csv-import"
        disabled={isImporting}
      />
      <label
        htmlFor="csv-import"
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
          isImporting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isImporting ? 'Importing...' : label}
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
