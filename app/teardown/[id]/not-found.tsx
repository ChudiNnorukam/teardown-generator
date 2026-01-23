import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              This analysis doesn't exist or has expired.
            </AlertDescription>
          </Alert>

          <Button asChild className="w-full">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
