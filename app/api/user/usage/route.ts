// GET /api/user/usage - Get current usage and rate limit info
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkRateLimit, type RateLimitResult } from '@/lib/rate-limit';

interface UsageResponse {
  limit: number;
  used: number;
  remaining: number;
  plan: 'free' | 'pro';
  isAuthenticated: boolean;
  resetAt?: string;
}

/**
 * Get client IP address from headers
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth (if logged in)
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    // Get session ID from cookie
    const sessionId = request.cookies.get('session_id')?.value || null;

    // Get client IP
    const ipAddress = getClientIp(request);

    // Check current rate limit status
    const rateLimit: RateLimitResult = await checkRateLimit({
      userId,
      sessionId,
      ipAddress,
    });

    const response: UsageResponse = {
      limit: rateLimit.limit,
      used: rateLimit.used,
      remaining: Math.max(0, rateLimit.limit - rateLimit.used),
      plan: rateLimit.plan,
      isAuthenticated: !!userId,
      resetAt: rateLimit.resetAt?.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage info' },
      { status: 500 }
    );
  }
}
