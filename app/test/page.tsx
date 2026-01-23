import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TechBadge } from '@/components/ui/TechBadge';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { AnalysisStep } from '@/components/ui/AnalysisStep';
import { PricingTierCard } from '@/components/ui/PricingTierCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8 space-y-12">
        <h1 className="text-3xl font-bold">Component Test Page</h1>

        {/* TechBadge Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">TechBadge</h2>
          <div className="flex flex-wrap gap-2">
            <TechBadge name="Next.js" category="Framework" confidence="high" />
            <TechBadge name="Tailwind CSS" category="CSS" confidence="high" />
            <TechBadge name="Vercel" category="Hosting" confidence="medium" />
            <TechBadge name="Supabase Auth" category="Auth" confidence="high" />
            <TechBadge name="Google Analytics" category="Analytics" confidence="low" />
            <TechBadge name="Stripe" category="Payments" confidence="high" />
          </div>
        </section>

        {/* ScoreGauge Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">ScoreGauge</h2>
          <div className="flex flex-wrap gap-8">
            <ScoreGauge score={25} label="Poor SEO" size="sm" />
            <ScoreGauge score={55} label="Average SEO" size="md" />
            <ScoreGauge score={85} label="Good SEO" size="lg" />
          </div>
        </section>

        {/* AnalysisStep Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">AnalysisStep</h2>
          <div className="space-y-4 max-w-2xl">
            <AnalysisStep
              step="Fetching website"
              status="complete"
              message="Website fetched successfully"
            />
            <AnalysisStep
              step="Detecting technologies"
              status="in_progress"
              message="Analyzing tech stack..."
            />
            <AnalysisStep
              step="Analyzing pricing"
              status="pending"
              message="Waiting to start..."
            />
            <AnalysisStep
              step="Error test"
              status="error"
              message="Something went wrong"
            />
          </div>
        </section>

        {/* PricingTierCard Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">PricingTierCard</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingTierCard
              name="Basic"
              price="$9"
              period="month"
              features={['10 analyses/month', 'Basic support', 'Email reports']}
            />
            <PricingTierCard
              name="Pro"
              price="$29"
              period="month"
              features={['100 analyses/month', 'Priority support', 'API access', 'Custom reports']}
              highlighted
            />
            <PricingTierCard
              name="Enterprise"
              price="$99"
              period="month"
              features={['Unlimited analyses', 'Dedicated support', 'White label', 'Custom integrations']}
            />
          </div>
        </section>

        {/* shadcn Components Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">shadcn Components</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Component</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This is a card with some content.</p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Input placeholder="Enter URL..." />
            <div className="flex gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          <Progress value={60} className="w-full" />

          <Tabs defaultValue="tab1" className="w-full">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <Card>
                <CardContent className="pt-6">
                  <p>Content for tab 1</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tab2">
              <Card>
                <CardContent className="pt-6">
                  <p>Content for tab 2</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tab3">
              <Card>
                <CardContent className="pt-6">
                  <p>Content for tab 3</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>
              This is an alert component with some information.
            </AlertDescription>
          </Alert>
        </section>
      </main>

      <Footer />
    </div>
  );
}
