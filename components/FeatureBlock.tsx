import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FeatureBlockProps {
  headline: string;
  body: string;
  visual: ReactNode;
  reversed?: boolean;
}

export function FeatureBlock({ headline, body, visual, reversed = false }: FeatureBlockProps) {
  return (
    <div
      className={cn(
        'grid md:grid-cols-2 gap-8 md:gap-12 items-center',
        reversed && 'md:grid-flow-dense'
      )}
    >
      <div className={cn('space-y-4', reversed && 'md:col-start-2')}>
        <h3 className="text-2xl md:text-3xl font-bold">{headline}</h3>
        <p className="text-lg text-muted-foreground leading-relaxed">{body}</p>
      </div>
      <div className={cn('flex items-center justify-center', reversed && 'md:col-start-1 md:row-start-1')}>
        {visual}
      </div>
    </div>
  );
}
