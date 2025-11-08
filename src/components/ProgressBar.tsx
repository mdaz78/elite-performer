interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: 'primary' | 'success' | 'accent';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar = ({
  progress,
  label,
  color = 'primary',
  showPercentage = true,
  className = '',
}: ProgressBarProps) => {
  const colorClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-400',
    success: 'bg-gradient-to-r from-success-500 to-success-600',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600',
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-body-sm font-medium text-neutral-600 dark:text-neutral-600">
            {label}
          </span>
          {showPercentage && (
            <span className="text-body-sm text-neutral-500 dark:text-neutral-500">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-neutral-200 dark:bg-neutral-200 rounded h-2 transition-colors duration-[150ms]">
        <div
          className={`h-2 rounded transition-all duration-[300ms] ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
