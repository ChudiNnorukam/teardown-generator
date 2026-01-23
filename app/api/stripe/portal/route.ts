import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, supabaseAdmin } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
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

    // Get Stripe customer ID
    const { data: tracking } = (await supabaseAdmin
      .from('usage_tracking')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()) as { data: Pick<Database['public']['Tables']['usage_tracking']['Row'], 'stripe_customer_id'> | null };

    if (!tracking?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 404 }
      );
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tracking.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
