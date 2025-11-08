interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: 'career' | 'trading' | 'fitness';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar = ({
  progress,
  label,
  color = 'career',
  showPercentage = true,
  className = '',
}: ProgressBarProps) => {
  const colorClasses = {
    career: 'bg-accent-blue dark:bg-accent-blue-dark',
    trading: 'bg-accent-emerald dark:bg-accent-emerald-dark',
    fitness: 'bg-accent-amber dark:bg-accent-amber-dark',
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition-colors duration-200">
            {label}
          </span>
          {showPercentage && (
            <span className="text-sm text-text-tertiary dark:text-text-tertiary-dark transition-colors duration-200">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-background dark:bg-background-dark rounded-full h-2.5 transition-colors duration-200">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
