'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Teardown page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {error.message || 'An unexpected error occurred while loading this analysis.'}
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick={reset} className="flex-1">
              Try Again
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
