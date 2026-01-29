import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, supabaseAdmin } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { validateCSRF } from '@/lib/csrf';
import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF protection
    if (!validateCSRF(request)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

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
      .select('id, stripe_customer_id, plan, subscription_id')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()) as {
      data: Pick<Database['public']['Tables']['usage_tracking']['Row'], 'id' | 'stripe_customer_id' | 'plan' | 'subscription_id'> | null;
    };

    // SECURITY: Prevent double subscriptions
    if (tracking?.plan === 'pro' && tracking?.subscription_id) {
      // User already has active subscription, redirect to billing portal
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: tracking.stripe_customer_id!,
        return_url: `${request.nextUrl.origin}/settings`,
      });

      return NextResponse.json({ url: portalSession.url });
    }

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

      if (tracking?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from('usage_tracking') as any)
          .update({ stripe_customer_id: customerId })
          .eq('id', tracking.id);
      } else {
        const today = new Date().toISOString().split('T')[0];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from('usage_tracking') as any).insert({
          user_id: userId,
          date: today,
          teardown_count: 0,
          plan: 'free',
          stripe_customer_id: customerId,
        });
      }
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
