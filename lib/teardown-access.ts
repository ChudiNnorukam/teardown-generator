import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type TeardownRow = Database['public']['Tables']['teardowns']['Row'];

export interface TeardownAccessResult {
  authorized: boolean;
  userId: string | null;
  sessionId: string | null;
  reason?: 'unauthorized' | 'forbidden';
}

export async function authorizeTeardownAccess(
  request: NextRequest,
  teardown: TeardownRow
): Promise<TeardownAccessResult> {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id ?? null;
  const sessionId = request.cookies.get('session_id')?.value ?? null;

  if (teardown.user_id) {
    if (userId && teardown.user_id === userId) {
      return { authorized: true, userId, sessionId };
    }

    return {
      authorized: false,
      userId,
      sessionId,
      reason: userId ? 'forbidden' : 'unauthorized',
    };
  }

  if (teardown.session_id && sessionId && teardown.session_id === sessionId) {
    return { authorized: true, userId, sessionId };
  }

  return {
    authorized: false,
    userId,
    sessionId,
    reason: 'forbidden',
  };
}
