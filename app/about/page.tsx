import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Linkedin, Globe, Github, Twitter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About - Teardown',
  description: 'Learn about Teardown and its creator, Chudi Nnorukam.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-12 md:py-16 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">About</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Built by an indie hacker,<br />for indie hackers
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Teardown was created to help founders and developers quickly understand
              their competition without expensive enterprise tools.
            </p>
          </div>

          {/* Creator Section */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-primary-foreground">
                    CN
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">Chudi Nnorukam</h2>
                    <p className="text-muted-foreground">
                      AI Systems Architect &amp; Automation Developer
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    I&apos;m an AI systems engineer based in Berkeley, California, focused on building
                    agent-based AI automation systems and micro-SaaS tools. I studied Data Science
                    at UC Berkeley and now spend my time shipping products that solve real problems.
                  </p>
                  <p className="text-muted-foreground">
                    I build with Claude, OpenAI, Next.js, and modern web technologies. Teardown is
                    part of my mission to create accessible tools for the indie hacker community.
                  </p>

                  {/* Other Products */}
                  <div>
                    <h3 className="font-semibold mb-2">Other products I&apos;ve shipped:</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">SEOAuditLite</Badge>
                      <Badge variant="secondary">StatementSync</Badge>
                      <Badge variant="secondary">Repurpose AI</Badge>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://www.linkedin.com/in/chudi-nnorukam-b91203143/" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://twitter.com/chaborukam" target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://github.com/ChudiNnorukam" target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://chudi-blog.vercel.app" target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Blog
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Teardown Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Why I built Teardown</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                When I started building micro-SaaS products, I constantly found myself manually
                researching competitors. What tech stack are they using? How do they price?
                What&apos;s their SEO strategy? How long would it take me to build something similar?
              </p>
              <p>
                Existing tools like Wappalyzer and BuiltWith are great for tech detection, but
                they&apos;re expensive and don&apos;t answer the questions indie hackers actually care about.
                I wanted a single tool that gives you the full picture in under a minute.
              </p>
              <p>
                Teardown combines tech stack detection, pricing analysis, SEO auditing, and build
                time estimation into one free tool. It&apos;s the competitive intelligence tool I
                wished I had when I started.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Get in touch</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Have feedback, feature requests, or just want to say hi?
                I&apos;d love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="mailto:chudi@teardown.dev">
                    <Mail className="w-4 h-4 mr-2" />
                    chudi@teardown.dev
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://twitter.com/chaborukam" target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4 mr-2" />
                    DM on Twitter
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Button variant="ghost" asChild>
              <Link href="/">
                &larr; Back to Teardown
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
