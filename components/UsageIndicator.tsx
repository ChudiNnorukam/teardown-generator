'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface UsageData {
  limit: number;
  used: number;
  remaining: number;
  plan: 'free' | 'pro';
  isAuthenticated: boolean;
  resetAt?: string;
}

export function UsageIndicator() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/usage')
      .then((res) => res.json())
      .then((data) => {
        setUsage(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const isLow = usage.remaining <= 1 && usage.remaining > 0;
  const isExhausted = usage.remaining === 0;

  if (usage.plan === 'pro') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
          <Zap className="h-3 w-3 mr-1" />
          Pro
        </Badge>
        <span className="text-muted-foreground">Unlimited analyses</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
      {isExhausted ? (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Daily limit reached</span>
          {usage.resetAt && (
            <span className="text-muted-foreground">
              • Resets {new Date(usage.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      ) : isLow ? (
        <div className="flex items-center gap-2 text-yellow-500">
          <AlertCircle className="h-4 w-4" />
          <span>{usage.remaining} analysis left today</span>
        </div>
      ) : (
        <span className="text-muted-foreground">
          {usage.remaining} of {usage.limit} analyses remaining today
        </span>
      )}

      {!usage.isAuthenticated && (
        <Link
          href="/signup"
          className="text-primary hover:underline ml-1"
        >
          Sign in for {usage.limit < 10 ? '10' : 'more'} free/day
        </Link>
      )}
    </div>
  );
}
