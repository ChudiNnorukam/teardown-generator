import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TechBadgeProps {
  name: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
}

// Design system colors: primary (orange) and accent (cyan)
const categoryColors: Record<string, string> = {
  Framework: 'bg-primary/10 text-primary border-primary/30',
  CSS: 'bg-accent/10 text-accent border-accent/30',
  Hosting: 'bg-primary/10 text-primary border-primary/30',
  Auth: 'bg-accent/10 text-accent border-accent/30',
  Analytics: 'bg-primary/10 text-primary border-primary/30',
  Payments: 'bg-accent/10 text-accent border-accent/30',
  Backend: 'bg-primary/10 text-primary border-primary/30',
  CDN: 'bg-accent/10 text-accent border-accent/30',
  Database: 'bg-primary/10 text-primary border-primary/30',
};

const confidenceStyles: Record<string, string> = {
  high: 'opacity-100 border-2',
  medium: 'opacity-80 border',
  low: 'opacity-60 border-dashed',
};

export function TechBadge({ name, category, confidence }: TechBadgeProps) {
  const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  const confidenceClass = confidenceStyles[confidence];

  return (
    <Badge
      variant="outline"
      className={cn(
        'px-3 py-1 font-medium transition-all',
        colorClass,
        confidenceClass
      )}
      title={`${name} - ${category} (${confidence} confidence)`}
    >
      {name}
    </Badge>
  );
}
