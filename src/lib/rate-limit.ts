// Rate limiting logic for teardown requests
import { supabaseAdmin } from './supabase/server';
import { createHash } from 'crypto';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  used: number;
  resetAt?: Date;
  plan: 'free' | 'pro';
}

export interface RateLimitConfig {
  userId?: string | null;
  sessionId?: string | null;
  ipAddress?: string;
}

function resolveLimit(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return fallback;
}

// Rate limit tiers
const RATE_LIMITS = {
  anonymous: resolveLimit(process.env.TEARDOWN_RATE_LIMIT_ANON, 3),
  free: resolveLimit(process.env.TEARDOWN_RATE_LIMIT_FREE, 10),
  pro: resolveLimit(process.env.TEARDOWN_RATE_LIMIT_PRO, 1000),
} as const;

/**
 * Hash IP address for privacy-preserving rate limiting
 */
function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * Check rate limit for a given user/session/IP
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { userId, ipAddress } = config;

  // Determine user type and limits
  let plan: 'free' | 'pro' = 'free';
  let limit: number;

  if (userId) {
    // Authenticated user - check their plan
    const { data: tracking } = await supabaseAdmin
      .from('usage_tracking')
      .select('plan, teardown_count')
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    plan = tracking?.plan || 'free';
    limit = plan === 'pro' ? RATE_LIMITS.pro : RATE_LIMITS.free;

    const used = tracking?.teardown_count || 0;

    if (used >= limit) {
      // Calculate reset time (midnight UTC)
      const now = new Date();
      const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

      return {
        allowed: false,
        limit,
        used,
        resetAt,
        plan,
      };
    }

    return {
      allowed: true,
      limit,
      used,
      plan,
    };
  } else {
    // Anonymous user - rate limit by IP hash
    if (!ipAddress) {
      throw new Error('IP address required for anonymous rate limiting');
    }

    const ipHash = hashIp(ipAddress);
    limit = RATE_LIMITS.anonymous;

    const { data: tracking } = await supabaseAdmin
      .from('usage_tracking')
      .select('teardown_count')
      .eq('ip_hash', ipHash)
      .eq('date', new Date().toISOString().split('T')[0])
      .is('user_id', null)
      .single();

    const used = tracking?.teardown_count || 0;

    if (used >= limit) {
      const now = new Date();
      const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

      return {
        allowed: false,
        limit,
        used,
        resetAt,
        plan: 'free',
      };
    }

    return {
      allowed: true,
      limit,
      used,
      plan: 'free',
    };
  }
}

/**
 * Increment usage count for a user/session/IP
 */
export async function incrementUsage(config: RateLimitConfig): Promise<void> {
  const { userId, sessionId, ipAddress } = config;
  const today = new Date().toISOString().split('T')[0];

  if (userId) {
    // Try to increment existing record
    const { data: existing } = await supabaseAdmin
      .from('usage_tracking')
      .select('id, teardown_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      await supabaseAdmin
        .from('usage_tracking')
        .update({ teardown_count: existing.teardown_count + 1 })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('usage_tracking').insert({
        user_id: userId,
        session_id: sessionId,
        date: today,
        teardown_count: 1,
        plan: 'free',
      });
    }
  } else {
    // Anonymous user
    if (!ipAddress) {
      throw new Error('IP address required for anonymous usage tracking');
    }

    const ipHash = hashIp(ipAddress);

    const { data: existing } = await supabaseAdmin
      .from('usage_tracking')
      .select('id, teardown_count')
      .eq('ip_hash', ipHash)
      .eq('date', today)
      .is('user_id', null)
      .single();

    if (existing) {
      await supabaseAdmin
        .from('usage_tracking')
        .update({ teardown_count: existing.teardown_count + 1 })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('usage_tracking').insert({
        user_id: null,
        session_id: sessionId,
        ip_hash: ipHash,
        date: today,
        teardown_count: 1,
        plan: 'free',
      });
    }
  }
}
