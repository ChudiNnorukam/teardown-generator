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
    const email = session.user.email!;

    // Get or create Stripe customer
    const { data: tracking } = (await supabaseAdmin
      .from('usage_tracking')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()) as { data: Pick<Database['public']['Tables']['usage_tracking']['Row'], 'stripe_customer_id'> | null };

    let customerId = tracking?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });

      customerId = customer.id;

      // Store customer ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin.from('usage_tracking') as any)
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/settings?upgraded=true`,
      cancel_url: `${request.nextUrl.origin}/#pricing`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
