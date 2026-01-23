import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';
import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string | null;

        if (!customerId) {
          console.error('Checkout session missing customer ID');
          break;
        }

        const { data: tracking } = (await supabaseAdmin
          .from('usage_tracking')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle()) as { data: Pick<Database['public']['Tables']['usage_tracking']['Row'], 'user_id'> | null };

        if (!tracking?.user_id) {
          console.error(`No usage tracking found for customer ${customerId}`);
          break;
        }

        // Update user to Pro plan
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin.from('usage_tracking') as any)
          .update({
            plan: 'pro',
            subscription_id: session.subscription as string,
          })
          .eq('user_id', tracking.user_id);

        console.log(`User ${tracking.user_id} upgraded to Pro`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: tracking } = (await supabaseAdmin
          .from('usage_tracking')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle()) as { data: Pick<Database['public']['Tables']['usage_tracking']['Row'], 'user_id'> | null };

        if (tracking?.user_id) {
          // Downgrade to free plan
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabaseAdmin.from('usage_tracking') as any)
            .update({
              plan: 'free',
              subscription_id: null,
            })
            .eq('user_id', tracking.user_id);

          console.log(`User ${tracking.user_id} downgraded to Free`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: tracking } = (await supabaseAdmin
          .from('usage_tracking')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle()) as { data: Pick<Database['public']['Tables']['usage_tracking']['Row'], 'user_id'> | null };

        if (tracking?.user_id) {
          // Check if subscription is canceled or past_due
          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabaseAdmin.from('usage_tracking') as any)
              .update({
                plan: 'free',
                subscription_id: null,
              })
              .eq('user_id', tracking.user_id);

            console.log(`User ${tracking.user_id} subscription status: ${subscription.status}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
