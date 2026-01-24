import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import type { CookieOptions } from '@supabase/ssr';

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
    console.error('[callback] OAuth error:', errorParam, errorDescription);
    const errorMsg = encodeURIComponent(errorDescription || errorParam);
    return NextResponse.redirect(`${origin}/login?error=${errorMsg}`);
  }

  if (code) {
    console.log('[callback] Starting with code:', code.slice(0, 10) + '...');

    // Determine redirect URL - handle Vercel preview deployments
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

    // Collect cookies to set on response
    const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

    // Create Supabase client that collects cookies
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookies) {
            console.log('[callback] setAll called with', cookies.length, 'cookies');
            cookies.forEach(({ name, value, options }) => {
              console.log('[callback] Collecting cookie:', name);
              cookiesToSet.push({ name, value, options });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[callback] Exchange error:', error.message);
      const errorMsg = encodeURIComponent(error.message);
      return NextResponse.redirect(`${origin}/login?error=${errorMsg}`);
    }

    console.log('[callback] Session created for:', data.user?.email);
    console.log('[callback] Cookies collected so far:', cookiesToSet.length);

    // Create response and set all collected cookies
    const response = NextResponse.redirect(redirectUrl);

    cookiesToSet.forEach(({ name, value, options }) => {
      console.log('[callback] Setting cookie on response:', name);
      response.cookies.set(name, value, options);
    });

    // Log final cookie count
    const setCookieHeaders = response.headers.getSetCookie();
    console.log('[callback] Final Set-Cookie headers count:', setCookieHeaders.length);

    return response;
  }

  console.error('[callback] No code provided');
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
