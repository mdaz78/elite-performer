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
    career: 'bg-career',
    trading: 'bg-trading',
    fitness: 'bg-fitness',
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
