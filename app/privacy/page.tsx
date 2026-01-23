import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - Teardown',
  description: 'Privacy Policy for Teardown - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 md:py-16">
        <article className="prose prose-invert max-w-3xl mx-auto">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2026</p>

          <h2>Introduction</h2>
          <p>
            Teardown (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your information
            when you use our website analysis service.
          </p>

          <h2>Information We Collect</h2>

          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Email address and password when you create an account</li>
            <li><strong>URLs Submitted:</strong> Website URLs you submit for analysis</li>
            <li><strong>Payment Information:</strong> Processed securely by Stripe; we do not store card details</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Pages visited, features used, analysis requests made</li>
            <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
            <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and improve our website analysis service</li>
            <li>To process your payments and manage your subscription</li>
            <li>To send transactional emails (account confirmation, password reset)</li>
            <li>To enforce our rate limits and prevent abuse</li>
            <li>To respond to your support requests</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We retain your analysis results for 30 days to allow you to access your history.
            Account data is retained until you delete your account. You can request deletion
            of your data at any time by contacting us.
          </p>

          <h2>Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Supabase (database), Vercel (hosting), Stripe (payments)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          </ul>

          <h2>Third-Party Websites</h2>
          <p>
            Our service analyzes publicly accessible information from third-party websites.
            We do not access private or authenticated content. The analysis only examines
            publicly visible HTML, headers, and scripts.
          </p>

          <h2>Security</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>HTTPS encryption for all data transmission</li>
            <li>Secure password hashing</li>
            <li>Regular security audits</li>
            <li>Access controls and monitoring</li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use essential cookies for authentication and session management.
            We do not use advertising or tracking cookies.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of
            significant changes by email or through our service.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@teardown.dev" className="text-primary hover:underline">
              privacy@teardown.dev
            </a>
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
