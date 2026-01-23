import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service - Teardown',
  description: 'Terms of Service for Teardown - Rules and guidelines for using our website analysis service.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 md:py-16">
        <article className="prose prose-invert max-w-3xl mx-auto">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2026</p>

          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using Teardown (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree, please do not use the Service.
          </p>

          <h2>Description of Service</h2>
          <p>
            Teardown is a SaaS competitive intelligence tool that analyzes publicly available
            information from websites, including:
          </p>
          <ul>
            <li>Technology stack detection</li>
            <li>Pricing page analysis</li>
            <li>SEO audit</li>
            <li>Clone complexity estimates</li>
          </ul>

          <h2>Acceptable Use</h2>
          <p>You agree to use the Service only for lawful purposes. You may NOT:</p>
          <ul>
            <li>Use the Service to harm, harass, or stalk others</li>
            <li>Attempt to access private or authenticated content</li>
            <li>Circumvent rate limits or abuse the Service</li>
            <li>Resell or redistribute analysis results commercially without permission</li>
            <li>Use automated tools to scrape or overload our Service</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>

          <h2>Account Terms</h2>
          <ul>
            <li>You must provide accurate information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must be at least 18 years old to use the Service</li>
            <li>One person may not maintain more than one free account</li>
          </ul>

          <h2>Free and Paid Plans</h2>

          <h3>Free Tier</h3>
          <ul>
            <li>3 analyses per day (anonymous users)</li>
            <li>10 analyses per day (signed-in users)</li>
            <li>Subject to change with notice</li>
          </ul>

          <h3>Pro Plan</h3>
          <ul>
            <li>Unlimited analyses</li>
            <li>Additional features as described on our pricing page</li>
            <li>Billed monthly via Stripe</li>
            <li>Cancel anytime; no refunds for partial months</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            The Service, including its code, design, and branding, is owned by Teardown.
            Analysis results are provided for your personal or internal business use.
            You may not claim ownership of our analysis methodology or algorithms.
          </p>

          <h2>Third-Party Websites</h2>
          <p>
            We analyze publicly available information from third-party websites. We do not
            guarantee the accuracy of our analysis. Website owners retain all rights to their
            content; our analysis does not grant you any rights to third-party intellectual property.
          </p>

          <h2>Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT
            GUARANTEE:
          </p>
          <ul>
            <li>100% accuracy of technology detection</li>
            <li>Completeness of pricing information</li>
            <li>Accuracy of clone estimates</li>
            <li>Uninterrupted availability of the Service</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TEARDOWN SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM
            YOUR USE OF THE SERVICE.
          </p>

          <h2>Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Teardown from any claims, damages, or
            expenses arising from your use of the Service or violation of these Terms.
          </p>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time for violation
            of these Terms or for any other reason. You may delete your account at any time.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Service after
            changes constitutes acceptance of the new Terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by the laws of the United States. Any disputes shall
            be resolved in the courts of Delaware.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:legal@teardown.dev" className="text-primary hover:underline">
              legal@teardown.dev
            </a>
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
