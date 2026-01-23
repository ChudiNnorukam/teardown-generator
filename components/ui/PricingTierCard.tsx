import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingTierCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}

export function PricingTierCard({
  name,
  price,
  period,
  features,
  highlighted = false,
}: PricingTierCardProps) {
  return (
    <Card
      className={cn(
        'relative transition-all',
        highlighted && 'border-primary border-2 shadow-lg'
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
          Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {period && <span className="text-muted-foreground ml-1">/{period}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
