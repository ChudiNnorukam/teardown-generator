'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [upgrading, setUpgrading] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [showUpgraded, setShowUpgraded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check for upgraded parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      setShowUpgraded(true);
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    }

    // Check auth and get user plan
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Get user plan from database
      fetch('/api/user/plan')
        .then((res) => res.json())
        .then((data) => {
          setPlan(data.plan || 'free');
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    });
  }, [router, supabase.auth]);

  const handleUpgrade = async () => {
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

  const handleManageSubscription = async () => {
    setManagingSubscription(true);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setManagingSubscription(false);
      }
    } catch (error) {
      setManagingSubscription(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and subscription</p>
          </div>

          {showUpgraded && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Successfully upgraded to Pro! Your new limits are now active.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-semibold capitalize">{plan}</p>
                    {plan === 'pro' && (
                      <Badge variant="default">Pro</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                {plan === 'free' ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p>Free plan includes:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>10 analyses per day</li>
                        <li>Full tech stack detection</li>
                        <li>Basic SEO audit</li>
                        <li>Clone estimates</li>
                      </ul>
                    </div>
                    <Button onClick={handleUpgrade} disabled={upgrading} className="w-full">
                      {upgrading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting to checkout...
                        </>
                      ) : (
                        'Upgrade to Pro ($19/month)'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <p>Pro plan includes:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>1000 analyses per day</li>
                        <li>Priority support</li>
                        <li>API access (coming soon)</li>
                        <li>Team sharing (coming soon)</li>
                      </ul>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={managingSubscription}
                      className="w-full"
                    >
                      {managingSubscription ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Manage Subscription'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
