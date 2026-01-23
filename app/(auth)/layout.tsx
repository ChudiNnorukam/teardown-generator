import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">Teardown</h1>
          </Link>
        </div>
        {children}
        <p className="text-center text-sm text-muted-foreground">
          © 2025 Teardown. Built with the MicroSaaSBot skill stack.
        </p>
      </div>
    </div>
  );
}
