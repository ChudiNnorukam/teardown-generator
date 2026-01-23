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

    // Create response FIRST (per Supabase SSR documentation)
    const response = NextResponse.redirect(redirectUrl);

    // Create Supabase client with cookie handlers that set on the response
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            console.log('[callback] setAll called with', cookiesToSet.length, 'cookies');
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log('[callback] Setting cookie:', name, 'options:', JSON.stringify(options));
              response.cookies.set(name, value, options);
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

    // Log the cookies that will be sent
    const setCookieHeaders = response.headers.getSetCookie();
    console.log('[callback] Set-Cookie headers count:', setCookieHeaders.length);
    setCookieHeaders.forEach((h, i) => console.log(`[callback] Cookie ${i}:`, h.substring(0, 100)));

    // Return response WITH cookies attached
    return response;
  }

  console.error('[callback] No code provided');
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
