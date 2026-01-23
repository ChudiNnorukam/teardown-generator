import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  max?: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16 text-sm',
  md: 'w-24 h-24 text-lg',
  lg: 'w-32 h-32 text-2xl',
};

const strokeWidths = {
  sm: 6,
  md: 8,
  lg: 10,
};

export function ScoreGauge({ score, max = 100, label, size = 'md' }: ScoreGaugeProps) {
  const percentage = Math.min((score / max) * 100, 100);
  const radius = size === 'sm' ? 28 : size === 'md' ? 40 : 52;
  const strokeWidth = strokeWidths[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage <= 40) return 'text-red-500';
    if (percentage <= 70) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getStrokeColor = () => {
    if (percentage <= 40) return '#ef4444';
    if (percentage <= 70) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizeClasses[size])}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', getColor())}>{score}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground text-center">{label}</p>
    </div>
  );
}
