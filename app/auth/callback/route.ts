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
    // Determine redirect URL based on environment
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

    // Create response first - we'll add cookies to it
    let response = NextResponse.redirect(redirectUrl);

    // Create Supabase client with cookie handlers that work with our response
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Set cookies on the response object
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error.message);
      const errorMsg = encodeURIComponent(error.message);
      return NextResponse.redirect(`${origin}/login?error=${errorMsg}`);
    }

    // Return the response with cookies set
    return response;
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
