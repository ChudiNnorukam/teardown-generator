import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();

    // Create response that we can set cookies on
    const response = NextResponse.redirect(`${origin}${next}`);

    // Track cookies that get set during the exchange
    const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Return both existing cookies and any we've set during this request
            const existingCookies = cookieStore.getAll();
            const newCookieNames = new Set(cookiesToSet.map(c => c.name));
            const filteredExisting = existingCookies.filter(c => !newCookieNames.has(c.name));
            return [
              ...filteredExisting,
              ...cookiesToSet.map(c => ({ name: c.name, value: c.value })),
            ];
          },
          setAll(cookies) {
            // Track cookies and set them on response
            cookies.forEach(({ name, value, options }) => {
              cookiesToSet.push({ name, value, options: options || {} });
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
