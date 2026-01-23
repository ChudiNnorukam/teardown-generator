import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UrlInputForm } from '@/components/UrlInputForm';
import { FeatureBlock } from '@/components/FeatureBlock';
import { TechBadge } from '@/components/ui/TechBadge';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { PricingTierCard } from '@/components/ui/PricingTierCard';
import { PricingSection } from '@/components/PricingSection';
import { ComparisonSection } from '@/components/ComparisonSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link2, Sparkles, FileText, Check } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Section 1: Hero */}
        <section className="container py-16 md:py-24">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-3 space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="text-sm">
                  Free SaaS Intelligence Tool
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                  Reverse-engineer any SaaS
                  <br />
                  <span className="text-primary">in 60 seconds</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  See exactly what tech stack they use, how they price, their SEO strategy, and
                  how long it would take to build a clone.
                </p>
              </div>

              <UrlInputForm />
            </div>

            <div className="md:col-span-2 hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl -z-10" />
                <Card className="overflow-hidden shadow-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-primary/20 rounded-full w-20" />
                      <div className="h-6 bg-accent/20 rounded-full w-24" />
                      <div className="h-6 bg-emerald-500/20 rounded-full w-16" />
                    </div>
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent" />
                        <div className="h-3 bg-muted rounded flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent" />
                        <div className="h-3 bg-muted rounded flex-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Social Proof Bar */}
        <section className="bg-card/50 border-y border-border py-8">
          <div className="container">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">SaaS apps analyzed</div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">45s</div>
                <div className="text-sm text-muted-foreground">Average analysis time</div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Technologies per site</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: How It Works */}
        <section id="how-it-works" className="container py-16 md:py-24">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to analyze any SaaS</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardContent className="pt-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Link2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Paste Any URL</h3>
                <p className="text-muted-foreground">
                  Enter any SaaS website. We support marketing sites, web apps, and landing pages.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Instant Analysis</h3>
                <p className="text-muted-foreground">
                  Our engine detects tech stack, scrapes pricing, audits SEO, and estimates build
                  complexity.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Get Insights</h3>
                <p className="text-muted-foreground">
                  Receive a detailed teardown with actionable intelligence you can use immediately.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 4: Feature Deep-Dive */}
        <section className="container py-16 md:py-24 space-y-20 md:space-y-32">
          {/* Feature 1: Tech Stack */}
          <FeatureBlock
            headline="Know exactly what they're building with"
            body="Detect frameworks (Next.js, Nuxt, Rails), hosting (Vercel, AWS), auth providers (Clerk, Auth0), payment processors (Stripe, Paddle), and 50+ other technologies."
            visual={
              <div className="grid grid-cols-3 gap-3 p-8 bg-muted/50 rounded-lg w-full max-w-md">
                <TechBadge name="Next.js" category="Framework" confidence="high" />
                <TechBadge name="React" category="Framework" confidence="high" />
                <TechBadge name="Tailwind" category="CSS" confidence="high" />
                <TechBadge name="Vercel" category="Hosting" confidence="high" />
                <TechBadge name="Stripe" category="Payments" confidence="medium" />
                <TechBadge name="Clerk" category="Auth" confidence="high" />
                <TechBadge name="Posthog" category="Analytics" confidence="low" />
                <TechBadge name="Supabase" category="Backend" confidence="medium" />
                <TechBadge name="TypeScript" category="Framework" confidence="high" />
              </div>
            }
          />

          {/* Feature 2: Pricing */}
          <FeatureBlock
            headline="Understand their monetization strategy"
            body="We find and parse pricing pages, extracting tier names, price points, and feature lists. See how competitors position their plans."
            visual={
              <div className="w-full max-w-sm">
                <PricingTierCard
                  name="Pro"
                  price="$29"
                  period="month"
                  features={[
                    '100 analyses/month',
                    'Priority support',
                    'API access',
                    'Custom reports',
                  ]}
                  highlighted
                />
              </div>
            }
            reversed
          />

          {/* Feature 3: SEO */}
          <FeatureBlock
            headline="See their organic growth tactics"
            body="Full SEO audit including meta tags, heading structure, Open Graph setup, robots.txt, and sitemap analysis. Scored 0-100 with specific recommendations."
            visual={
              <div className="flex flex-col items-center gap-6 p-8 bg-muted/50 rounded-lg">
                <ScoreGauge score={85} label="SEO Score" size="lg" />
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent" />
                    <span>Meta tags optimized</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent" />
                    <span>Mobile friendly</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent" />
                    <span>Fast page load</span>
                  </div>
                </div>
              </div>
            }
          />

          {/* Feature 4: Clone Estimate */}
          <FeatureBlock
            headline="Plan your own build with confidence"
            body="Get hour estimates broken down by component, required skills list, and links to similar open source projects. Know before you code."
            visual={
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Base Website</span>
                    <span className="font-semibold">10h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Authentication</span>
                    <span className="font-semibold">20h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Integration</span>
                    <span className="font-semibold">15h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Backend & Database</span>
                    <span className="font-semibold">25h</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                    <span>Total Estimate</span>
                    <span className="text-primary">70h</span>
                  </div>
                </CardContent>
              </Card>
            }
            reversed
          />
        </section>

        {/* Section 5: Example Teardown */}
        <section className="bg-card/50 border-y border-border py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">See it in action</h2>
              <p className="text-lg text-muted-foreground">
                Real teardown of Stripe.com showing the depth of insights you get
              </p>
            </div>

            <Card className="max-w-4xl mx-auto overflow-hidden shadow-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b">
                  <Image
                    src="https://www.google.com/s2/favicons?domain=stripe.com&sz=32"
                    alt="Stripe"
                    className="w-8 h-8"
                    width={32}
                    height={32}
                    unoptimized
                  />
                  <div>
                    <div className="font-semibold">stripe.com</div>
                    <div className="text-sm text-muted-foreground">Analysis completed</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">2</div>
                    <div className="text-sm text-muted-foreground">Technologies detected</div>
                    <div className="flex gap-2 pt-2">
                      <TechBadge name="Tailwind" category="CSS" confidence="high" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-3xl font-bold">5</div>
                    <div className="text-sm text-muted-foreground">Pricing tiers found</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-3xl font-bold">62/100</div>
                    <div className="text-sm text-muted-foreground">SEO score</div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button asChild className="w-full md:w-auto">
                    <a href="#hero">Try it yourself →</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 6: Comparison */}
        <ComparisonSection />

        {/* Section 7: Pricing */}
        <PricingSection />

        {/* Section 7: FAQ */}
        <section className="bg-card/50 border-y border-border py-16 md:py-24">
          <div className="container max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="legal" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  Is this legal?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. We only analyze publicly available information - the same data any visitor to
                  the website can see. We don&apos;t bypass authentication, scrape private data, or
                  violate any terms of service.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="accuracy" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  How accurate is the tech detection?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our detection is 85%+ accurate for common stacks like Next.js, React, Tailwind,
                  and Vercel. Less common technologies may not be detected. We show confidence
                  levels for each detection.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="competitors" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  Can I analyze my competitors?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. That&apos;s the main use case. Understand what technologies your
                  competitors use, how they price, and what their SEO strategy looks like.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="blocked" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  What if a site blocks the analysis?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Some sites block automated access. If we can&apos;t fetch a site, we&apos;ll let you know.
                  Most marketing sites and landing pages work fine.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="estimates" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  How do you calculate clone estimates?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We estimate based on detected complexity: authentication (+20h), payments (+15h),
                  dashboard UI (+30h), etc. These are rough estimates for planning purposes, not
                  precise quotes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  Will you add more features?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! We&apos;re working on: historical tracking, API access, team sharing, and custom
                  reports. Pro subscribers get early access to new features.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Section 8: Final CTA */}
        <section id="hero" className="bg-card border-t border-border py-16 md:py-24">
          <div className="container text-center space-y-8">
            <div className="space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold">
                Ready to reverse-engineer the competition?
              </h2>
              <p className="text-xl text-muted-foreground">
                Start with 3 free analyses. No signup required.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <UrlInputForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Section 9: Footer */}
      <Footer />
    </div>
  );
}
