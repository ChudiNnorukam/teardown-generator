'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnalysisStep } from '@/components/ui/AnalysisStep';
import { TechBadge } from '@/components/ui/TechBadge';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { PricingTierCard } from '@/components/ui/PricingTierCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Share, Check, X } from 'lucide-react';
import Image from 'next/image';
import type { TeardownWithResults, CloneBreakdown } from '@/types/database';

interface TechStackPreview {
  name: string;
  category: string;
  confidence: string;
}

interface StreamMessage {
  step: string;
  status: 'in_progress' | 'complete' | 'failed';
  message: string;
  preview?: TechStackPreview[];
  teardownId?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

type StepStatus = 'pending' | 'in_progress' | 'complete' | 'error';

interface StepState {
  status: StepStatus;
  message: string;
  preview?: TechStackPreview[];
}

const STEPS = [
  { key: 'fetching', label: 'Fetching website' },
  { key: 'tech_stack', label: 'Detecting technologies' },
  { key: 'pricing', label: 'Analyzing pricing' },
  { key: 'seo', label: 'Running SEO audit' },
  { key: 'clone', label: 'Calculating build estimate' },
];

export default function TeardownPage({ params }: PageProps) {
  const { id } = use(params);
  const [teardown, setTeardown] = useState<TeardownWithResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, StepState>>(() =>
    Object.fromEntries(
      STEPS.map(({ key }) => [key, { status: 'pending' as StepStatus, message: 'Waiting...' }])
    )
  );

  const startAnalysis = useCallback(() => {
    const eventSource = new EventSource(`/api/teardown/${id}/analyze`);

    eventSource.onmessage = (event) => {
      try {
        const data: StreamMessage = JSON.parse(event.data);

        setSteps((prev) => ({
          ...prev,
          [data.step]: {
            status: data.status === 'complete' ? 'complete' : data.status === 'failed' ? 'error' : 'in_progress',
            message: data.message,
            preview: data.preview,
          },
        }));

        // If done, refetch teardown to get final results
        if (data.step === 'done' && data.status === 'complete') {
          eventSource.close();
          setTimeout(async () => {
            const res = await fetch(`/api/teardown/${id}`);
            const result = await res.json();
            setTeardown(result.teardown);
            setLoading(false);
          }, 500);
        }

        if (data.status === 'failed') {
          eventSource.close();
          setError(data.message);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setError('Connection lost. Please refresh the page.');
      setLoading(false);
    };
  }, [id]);

  // Fetch teardown data
  useEffect(() => {
    async function fetchTeardown() {
      try {
        const res = await fetch(`/api/teardown/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Teardown not found');
          } else {
            setError('Failed to load teardown');
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setTeardown(data.teardown);

        // If already completed, show results immediately
        if (data.teardown.status === 'completed') {
          setLoading(false);
          // Mark all steps as complete
          setSteps(
            Object.fromEntries(
              STEPS.map(({ key }) => [key, { status: 'complete' as StepStatus, message: 'Done' }])
            )
          );
        } else if (data.teardown.status === 'failed') {
          setError(data.teardown.error_message || 'Analysis failed');
          setLoading(false);
        } else if (data.teardown.status === 'pending' || data.teardown.status === 'processing') {
          // Start SSE stream
          startAnalysis();
        }
      } catch {
        setError('Network error');
        setLoading(false);
      }
    }

    fetchTeardown();
  }, [id, startAnalysis]);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-6 flex gap-4">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!teardown) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const faviconUrl = getFaviconUrl(teardown.target_url);

  // State A: Analysis in progress
  if (loading && (teardown.status === 'pending' || teardown.status === 'processing')) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </Button>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
              {faviconUrl && <Image src={faviconUrl} alt="" className="w-8 h-8" width={32} height={32} unoptimized />}
              <div>
                <h1 className="text-2xl font-bold">Analyzing...</h1>
                <p className="text-muted-foreground">{teardown.target_url}</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {STEPS.map(({ key, label }) => (
                  <AnalysisStep
                    key={key}
                    step={label}
                    status={steps[key]?.status || 'pending'}
                    message={steps[key]?.message || 'Waiting...'}
                    preview={steps[key]?.preview}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // State B: Analysis complete - show results
  const results = teardown.results;

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Results</AlertTitle>
            <AlertDescription>
              Analysis completed but no results available.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  const techCount = results.tech_stack?.length || 0;
  const seoScore = results.seo_audit?.score || 0;
  const totalHours = results.clone_estimate?.totalHours || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </Button>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Results Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {faviconUrl && <Image src={faviconUrl} alt="" className="w-10 h-10" width={40} height={40} unoptimized />}
              <div className="flex-1">
                <h1 className="text-3xl font-bold">Analysis Complete</h1>
                <p className="text-muted-foreground">{teardown.target_url}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium">{techCount} technologies</span>
              <span>•</span>
              <span className="font-medium">SEO {seoScore}/100</span>
              <span>•</span>
              <span className="font-medium">~{totalHours} hours to clone</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={copyUrl}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button asChild>
                <Link href="/">Analyze Another</Link>
              </Button>
            </div>
          </div>

          {/* Tabbed Results */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tech">Tech Stack</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="clone">Clone Estimate</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{techCount}</div>
                    <p className="text-xs text-muted-foreground">Detected</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{seoScore}/100</div>
                    <p className="text-xs text-muted-foreground">
                      {seoScore >= 70 ? 'Good' : seoScore >= 40 ? 'Fair' : 'Needs Work'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Build Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalHours}h</div>
                    <p className="text-xs text-muted-foreground">{results.clone_estimate?.complexity}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Pricing Tiers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {results.pricing_analysis?.tiers?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {results.pricing_analysis?.found ? 'Found' : 'Not found'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tech Stack Tab */}
            <TabsContent value="tech" className="space-y-6">
              {techCount === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No technologies detected</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {Object.entries(
                    results.tech_stack!.reduce((acc, tech) => {
                      if (!acc[tech.category]) acc[tech.category] = [];
                      acc[tech.category].push(tech);
                      return acc;
                    }, {} as Record<string, typeof results.tech_stack>)
                  ).map(([category, techs]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {techs.map((tech) => (
                          <TechBadge
                            key={tech.name}
                            name={tech.name}
                            category={tech.category}
                            confidence={tech.confidence}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              {!results.pricing_analysis?.found || !results.pricing_analysis.tiers?.length ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No pricing page detected - the site may not have public pricing
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.pricing_analysis.tiers.map((tier, idx) => (
                    <PricingTierCard
                      key={idx}
                      name={tier.name}
                      price={tier.price}
                      period={tier.period || ''}
                      features={tier.features}
                      highlighted={idx === 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <div className="flex justify-center py-6">
                <ScoreGauge score={seoScore} label="SEO Score" size="lg" />
              </div>

              <div className="space-y-3">
                {results.seo_audit?.checks?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 border rounded-lg"
                  >
                    {item.passed ? (
                      <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{item.name}</p>
                      {item.value && (
                        <p className="text-sm text-muted-foreground">Current: {item.value}</p>
                      )}
                      {!item.passed && item.recommendation && (
                        <p className="text-sm text-muted-foreground">
                          Recommendation: {item.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Clone Estimate Tab */}
            <TabsContent value="clone" className="space-y-6">
              {/* Important Disclaimer */}
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-500">MVP Estimate Only</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  This estimate assumes an <strong>experienced full-stack developer</strong> building a <strong>minimum viable product</strong>.
                  For production-ready quality with testing, documentation, and polish, multiply by 3-5x.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Estimated Build Time</span>
                    <span className="text-3xl font-bold text-primary">{totalHours} hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Complexity with explanation */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Complexity Level</h3>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">
                        {results.clone_estimate?.complexity}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {results.clone_estimate?.complexity === 'simple' && '(Basic functionality, minimal integrations)'}
                        {results.clone_estimate?.complexity === 'moderate' && '(Multiple features, some integrations)'}
                        {results.clone_estimate?.complexity === 'complex' && '(Advanced features, many integrations)'}
                        {results.clone_estimate?.complexity === 'very-complex' && '(Enterprise-grade, extensive integrations)'}
                      </span>
                    </div>
                  </div>

                  {/* Production-Ready Estimate */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Production-Ready Estimates</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">MVP (this estimate)</p>
                        <p className="font-bold text-lg">{totalHours}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">With testing &amp; docs</p>
                        <p className="font-bold text-lg">{Math.round(totalHours * 2)}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Production quality</p>
                        <p className="font-bold text-lg">{Math.round(totalHours * 3)}-{Math.round(totalHours * 4)}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Enterprise-grade</p>
                        <p className="font-bold text-lg">{Math.round(totalHours * 5)}h+</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Breakdown</h3>
                    <div className="space-y-2">
                      {results.clone_estimate?.breakdown?.map((item: CloneBreakdown, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.component}</p>
                            <p className="text-sm text-muted-foreground">{item.reason}</p>
                          </div>
                          <span className="font-semibold text-primary ml-4">{item.hours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.clone_estimate?.requiredSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-muted text-sm rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {results.clone_estimate?.similarOpenSource && results.clone_estimate.similarOpenSource.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Similar Open Source Projects</h3>
                      <ul className="space-y-2">
                        {results.clone_estimate.similarOpenSource.map((project, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">→</span>
                            <span>{project}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
