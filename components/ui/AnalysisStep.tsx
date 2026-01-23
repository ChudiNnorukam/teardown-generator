import { Clock, Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechStackPreview {
  name: string;
  category: string;
  confidence: string;
}

interface AnalysisStepProps {
  step: string;
  status: 'pending' | 'in_progress' | 'complete' | 'error';
  message: string;
  preview?: TechStackPreview[];
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    spin: false,
  },
  in_progress: {
    icon: Loader2,
    color: 'text-primary',
    bg: 'bg-primary/10',
    spin: true,
  },
  complete: {
    icon: Check,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    spin: false,
  },
  error: {
    icon: X,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    spin: false,
  },
};

export function AnalysisStep({ step, status, message, preview }: AnalysisStepProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex gap-4 items-start">
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
          config.bg
        )}
      >
        <Icon
          className={cn('w-5 h-5', config.color, config.spin && 'animate-spin')}
        />
      </div>
      <div className="flex-1 space-y-1 pt-1">
        <p className="font-medium text-foreground">{step}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
        {preview && status === 'complete' && (
          <div className="mt-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md">
            {Array.isArray(preview) && preview.length > 0 && (
              <span>Preview: {preview.map((p) => p.name).join(', ')}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
