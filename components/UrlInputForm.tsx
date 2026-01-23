'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UsageIndicator } from '@/components/UsageIndicator';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export function UrlInputForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (input: string): boolean => {
    try {
      const urlObj = new URL(input);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/teardown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting error specifically
        if (response.status === 429) {
          const resetDate = data.resetAt
            ? new Date(data.resetAt).toLocaleString()
            : 'tomorrow';
          setError(
            `Daily limit reached (${data.used}/${data.limit} analyses used). Resets at ${resetDate}. Sign up for more.`
          );
        } else {
          setError(data.message || 'Failed to create analysis');
        }
        setLoading(false);
        return;
      }

      // Redirect to teardown page
      router.push(`/teardown/${data.teardownId}`);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="flex-1 h-12 text-base"
        />
        <Button type="submit" disabled={loading} size="lg" className="h-12 px-8">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze This SaaS
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center gap-3">
        <UsageIndicator />
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">✓ Free</span>
          <span className="flex items-center gap-1">✓ No signup required</span>
          <span className="flex items-center gap-1">✓ Instant results</span>
        </div>
      </div>
    </form>
  );
}
