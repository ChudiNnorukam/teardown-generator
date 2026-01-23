import { NextResponse } from 'next/server';
import { createServerClient, supabaseAdmin } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user plan from usage_tracking
    const { data: tracking } = (await supabaseAdmin
      .from('usage_tracking')
      .select('plan')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()) as { data: Pick<Database['public']['Tables']['usage_tracking']['Row'], 'plan'> | null };

    return NextResponse.json({
      plan: tracking?.plan || 'free',
    });
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch user plan' },
      { status: 500 }
    );
  }
}
