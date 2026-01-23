import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/';
  if (!next.startsWith('/')) {
    next = '/';
  }

  // Handle OAuth errors from provider
  if (errorParam) {
    const errorMsg = encodeURIComponent(errorDescription || errorParam);
    return NextResponse.redirect(`${origin}/login?error=${errorMsg}`);
  }

  if (code) {
    // Determine redirect URL
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';
    let redirectUrl: string;

    if (isLocalEnv) {
      redirectUrl = `${origin}${next}`;
    } else if (forwardedHost) {
      redirectUrl = `https://${forwardedHost}${next}`;
    } else {
      redirectUrl = `${origin}${next}`;
    }

    // Track cookies to set - we'll add them to the response after exchange
    const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];

    // Create Supabase client with cookie handlers
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              cookiesToSet.push({ name, value, options: options || {} });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error.message);
      const errorMsg = encodeURIComponent(error.message);
      return NextResponse.redirect(`${origin}/login?error=${errorMsg}`);
    }

    if (data.session) {
      // Create redirect response and add all cookies
      const response = NextResponse.redirect(redirectUrl);

      // Add all session cookies to the response
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
      }

      return response;
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
