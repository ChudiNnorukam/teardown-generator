// POST /api/teardown - Submit a new teardown request
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createServerClient } from '@/lib/supabase/server';
import { validateAndNormalizeUrl } from '@/lib/url-utils';
import { checkRateLimit, incrementUsage } from '@/lib/rate-limit';
import { randomBytes } from 'crypto';
import type { Database } from '@/types/database';

interface TeardownRequest {
  url: string;
}

interface TeardownResponse {
  teardownId: string;
  status: 'pending' | 'cached';
  cached: boolean;
}

interface ErrorResponse {
  error: string;
  message?: string;
  resetAt?: string;
  limit?: number;
  used?: number;
}

/**
 * Get or create session ID from cookies
 */
function getOrCreateSessionId(request: NextRequest): string {
  const existingSession = request.cookies.get('session_id')?.value;
  if (existingSession) {
    return existingSession;
  }

  // Generate new session ID
  return randomBytes(32).toString('hex');
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

/**
 * Check if domain was recently analyzed by this user/session
 */
async function checkRecentDuplicate(
  domain: string,
  userId: string | null,
  sessionId: string
): Promise<{ isDuplicate: boolean; teardownId?: string }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  let query = supabaseAdmin
    .from('teardowns')
    .select('id, status')
    .eq('target_domain', domain)
    .gte('created_at', oneHourAgo);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }

  const { data } = (await query.order('created_at', { ascending: false }).limit(1).single()) as { data: Pick<Database['public']['Tables']['teardowns']['Row'], 'id' | 'status'> | null };

  if (data) {
    return { isDuplicate: true, teardownId: data.id };
  }

  return { isDuplicate: false };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: TeardownRequest = await request.json();

    // Validate URL
    const validation = validateAndNormalizeUrl(body.url);
    if (!validation.valid) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'invalid_url',
          message: validation.error,
        },
        { status: 400 }
      );
    }

    const { normalizedUrl, domain } = validation;

    // Get user ID from auth (if logged in)
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    // Get or create session ID
    const sessionId = getOrCreateSessionId(request);

    // Get client IP
    const ipAddress = getClientIp(request);

    // Check rate limits
    const rateLimit = await checkRateLimit({
      userId,
      sessionId,
      ipAddress,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'rate_limit',
          message: `Rate limit exceeded. You have used ${rateLimit.used}/${rateLimit.limit} requests today.`,
          resetAt: rateLimit.resetAt?.toISOString(),
          limit: rateLimit.limit,
          used: rateLimit.used,
        },
        { status: 429 }
      );
    }

    // Check for recent duplicate
    const duplicate = await checkRecentDuplicate(domain!, userId, sessionId);

    if (duplicate.isDuplicate) {
      // Return existing teardown (don't increment usage)
      return NextResponse.json<TeardownResponse>(
        {
          teardownId: duplicate.teardownId!,
          status: 'cached',
          cached: true,
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
          },
        }
      );
    }

    // Create new teardown record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teardown, error: insertError } = (await (supabaseAdmin.from('teardowns') as any)
      .insert({
        user_id: userId,
        session_id: sessionId,
        target_url: normalizedUrl!,
        status: 'pending',
      })
      .select('id')
      .single()) as { data: Pick<Database['public']['Tables']['teardowns']['Row'], 'id'> | null; error: unknown };

    if (insertError || !teardown) {
      console.error('Failed to create teardown:', insertError);
      return NextResponse.json<ErrorResponse>(
        {
          error: 'internal_error',
          message: 'Failed to create teardown request',
        },
        { status: 500 }
      );
    }

    // Increment usage tracking
    await incrementUsage({
      userId,
      sessionId,
      ipAddress,
    });

    // Return success response with session cookie
    return NextResponse.json<TeardownResponse>(
      {
        teardownId: teardown.id,
        status: 'pending',
        cached: false,
      },
      {
        status: 201,
        headers: {
          'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
        },
      }
    );
  } catch (error) {
    console.error('Teardown API error:', error);
    return NextResponse.json<ErrorResponse>(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
