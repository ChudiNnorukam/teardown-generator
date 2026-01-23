'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PricingTierCard } from '@/components/ui/PricingTierCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export function PricingSection() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<'free' | 'pro' | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);

      if (session?.user) {
        // Fetch user plan
        fetch('/api/user/plan')
          .then((res) => res.json())
          .then((data) => {
            setPlan(data.plan || 'free');
            setLoading(false);
          })
          .catch(() => {
            setPlan('free');
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleProClick = async () => {
    if (!user) {
      // Not logged in - redirect to signup
      router.push('/signup?plan=pro');
      return;
    }

    if (plan === 'pro') {
      // Already pro - do nothing
      return;
    }

    // Free user - start checkout
    setUpgrading(true);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setUpgrading(false);
      }
    } catch (error) {
      setUpgrading(false);
    }
  };

  const getProButtonText = () => {
    if (upgrading) return 'Redirecting...';
    if (loading) return 'Loading...';
    if (plan === 'pro') return 'Current Plan';
    if (user) return 'Upgrade to Pro';
    return 'Sign up to Upgrade';
  };

  const getProButtonIcon = () => {
    if (upgrading || loading) {
      return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
    }
    return null;
  };

  return (
    <section id="pricing" className="container py-16 md:py-24">
      <div className="text-center mb-12 space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
        <p className="text-lg text-muted-foreground">
          Start free, upgrade when you need more
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PricingTierCard
          name="Free"
          price="$0"
          period="forever"
          features={[
            '3 analyses per day (anonymous)',
            '10 analyses per day (signed in)',
            'Full tech stack detection',
            'Basic SEO audit',
            'Clone estimates',
            'Community support',
          ]}
        />

        <div className="relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            Coming Soon
          </Badge>
          <div className="relative">
            <PricingTierCard
              name="Pro"
              price="$19"
              period="month"
              features={[
                'Unlimited analyses',
                'PDF export',
                'API access',
                'Priority support',
                'Historical tracking',
                'Team sharing',
              ]}
              highlighted
            />
            <div className="absolute inset-x-0 bottom-6 px-6">
              <Button
                onClick={handleProClick}
                disabled={plan === 'pro' || upgrading || loading}
                className="w-full"
              >
                {getProButtonIcon()}
                {getProButtonText()}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Pro plan launches soon. {!user && 'Sign up to get notified.'}
        </p>
      </div>
    </section>
  );
}
