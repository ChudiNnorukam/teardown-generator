'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';

/**
 * Parse error message to provide helpful context
 */
function parseErrorMessage(message: string): { title: string; description: string; suggestions: string[] } {
  const messageLower = message.toLowerCase();

  if (messageLower.includes('timeout')) {
    return {
      title: 'Connection Timed Out',
      description: 'The website took too long to respond to our request.',
      suggestions: [
        'Wait a moment and try again',
        'Check if the website is online',
        'Try the main homepage instead of a specific page',
      ],
    };
  }

  if (messageLower.includes('blocked') || messageLower.includes('403')) {
    return {
      title: 'Access Blocked',
      description: 'The website prevented us from accessing it.',
      suggestions: [
        'Some sites block automated analysis tools',
        'Try a different page on the same site',
        'Contact us if you need this site analyzed',
      ],
    };
  }

  if (messageLower.includes('not found') || messageLower.includes('404')) {
    return {
      title: 'Page Not Found',
      description: 'The URL you entered doesn\'t seem to exist.',
      suggestions: [
        'Double-check the URL for typos',
        'Make sure to include https://',
        'Try the main domain instead of a specific page',
      ],
    };
  }

  if (messageLower.includes('network') || messageLower.includes('fetch')) {
    return {
      title: 'Network Error',
      description: 'We couldn\'t connect to the website.',
      suggestions: [
        'Check your internet connection',
        'Verify the website is online',
        'Try again in a few moments',
      ],
    };
  }

  // Default
  return {
    title: 'Analysis Failed',
    description: message || 'Something went wrong while analyzing this website.',
    suggestions: [
      'Try again with the same URL',
      'Try a different URL',
      'Contact support if the problem persists',
    ],
  };
}

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

  const { title, description, suggestions } = useMemo(
    () => parseErrorMessage(error.message),
    [error.message]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 flex items-center justify-center">
        <div className="max-w-lg w-full space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg">{title}</AlertTitle>
            <AlertDescription className="mt-2">
              {description}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                What you can do
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={reset} className="flex-1" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Analyze New Site
              </Link>
            </Button>
          </div>

          {error.digest && (
            <p className="text-xs text-center text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
