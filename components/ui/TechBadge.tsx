import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TechBadgeProps {
  name: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
}

const categoryColors: Record<string, string> = {
  Framework: 'bg-blue-100 text-blue-700 border-blue-300',
  CSS: 'bg-purple-100 text-purple-700 border-purple-300',
  Hosting: 'bg-green-100 text-green-700 border-green-300',
  Auth: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Analytics: 'bg-orange-100 text-orange-700 border-orange-300',
  Payments: 'bg-pink-100 text-pink-700 border-pink-300',
  Backend: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  CDN: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  Database: 'bg-teal-100 text-teal-700 border-teal-300',
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
