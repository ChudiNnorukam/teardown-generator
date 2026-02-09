import { describe, it, expect } from 'vitest';
import { analyzeCloneEstimate } from '@/lib/analyzer/clone-estimate';
import type { TechStackItem, PricingAnalysis, SEOAudit } from '@/types/database';

describe('clone-estimate', () => {
  describe('analyzeCloneEstimate', () => {
    it('base website always has 10 hours', async () => {
      const techStack: TechStackItem[] = [];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      const baseBreakdown = result.breakdown.find((b) => b.component === 'Base Website');
      expect(baseBreakdown?.hours).toBe(10);
    });

    it('auth tech adds 20 hours', async () => {
      const techStack: TechStackItem[] = [
        {
          name: 'Clerk',
          category: 'Auth',
          confidence: 'high',
          evidence: 'Detected in HTML',
        },
      ];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      const authBreakdown = result.breakdown.find((b) => b.component === 'Authentication');
      expect(authBreakdown?.hours).toBe(20);
    });

    it('payments tech adds 15 hours', async () => {
      const techStack: TechStackItem[] = [
        {
          name: 'Stripe',
          category: 'Payments',
          confidence: 'high',
          evidence: 'Detected in scripts',
        },
      ];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      const paymentBreakdown = result.breakdown.find(
        (b) => b.component === 'Payment Integration'
      );
      expect(paymentBreakdown?.hours).toBe(15);
    });

    it('backend tech adds 25 hours', async () => {
      const techStack: TechStackItem[] = [
        {
          name: 'Firebase',
          category: 'Backend',
          confidence: 'high',
          evidence: 'Detected in scripts',
        },
      ];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      const backendBreakdown = result.breakdown.find((b) => b.component === 'Backend & Database');
      expect(backendBreakdown?.hours).toBe(25);
    });

    it('analytics tech adds 3 hours', async () => {
      const techStack: TechStackItem[] = [
        {
          name: 'Google Analytics',
          category: 'Analytics',
          confidence: 'high',
          evidence: 'Detected in scripts',
        },
      ];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      const analyticsBreakdown = result.breakdown.find((b) => b.component === 'Analytics Setup');
      expect(analyticsBreakdown?.hours).toBe(3);
    });

    it('pricing tiers add 8 hours', async () => {
      const techStack: TechStackItem[] = [];
      const pricing: PricingAnalysis = {
        found: true,
        url: 'https://example.com/pricing',
        tiers: [
          { name: 'Free', price: '0', period: 'month', features: [] },
          { name: 'Pro', price: '99', period: 'month', features: [] },
        ],
      };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      const pricingBreakdown = result.breakdown.find((b) => b.component === 'Pricing Page');
      expect(pricingBreakdown?.hours).toBe(8);
    });

    it('low SEO score (<70) adds 5 hours', async () => {
      const techStack: TechStackItem[] = [];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 50, checks: [], summary: 'Poor SEO' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      const seoBreakdown = result.breakdown.find((b) => b.component === 'SEO Improvements');
      expect(seoBreakdown?.hours).toBe(5);
    });

    it('framework adds 5 hours', async () => {
      const techStack: TechStackItem[] = [
        {
          name: 'Next.js',
          category: 'Framework',
          confidence: 'high',
          evidence: 'Detected',
        },
      ];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      const frameworkBreakdown = result.breakdown.find((b) => b.component === 'Framework Setup');
      expect(frameworkBreakdown?.hours).toBe(5);
    });

    it('empty tech stack returns 10 hours with simple complexity', async () => {
      const techStack: TechStackItem[] = [];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      expect(result.totalHours).toBe(10);
      expect(result.complexity).toBe('simple');
    });

    it('full stack (auth+payments+backend+analytics+framework) returns complex or very-complex', async () => {
      const techStack: TechStackItem[] = [
        {
          name: 'Clerk',
          category: 'Auth',
          confidence: 'high',
          evidence: 'Detected',
        },
        {
          name: 'Stripe',
          category: 'Payments',
          confidence: 'high',
          evidence: 'Detected',
        },
        {
          name: 'Firebase',
          category: 'Backend',
          confidence: 'high',
          evidence: 'Detected',
        },
        {
          name: 'Google Analytics',
          category: 'Analytics',
          confidence: 'high',
          evidence: 'Detected',
        },
        {
          name: 'Next.js',
          category: 'Framework',
          confidence: 'high',
          evidence: 'Detected',
        },
      ];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      expect(['complex', 'very-complex']).toContain(result.complexity);
    });

    it('complexity tiers: <=20 hours = simple, 21-50 = moderate, 51-100 = complex, >100 = very-complex', async () => {
      // Simple: 10 base
      const simpleResult = await analyzeCloneEstimate(
        [],
        { found: false },
        { score: 100, checks: [], summary: 'Perfect' }
      );
      expect(simpleResult.complexity).toBe('simple');

      // Moderate: 10 + 20 (auth)
      const moderateResult = await analyzeCloneEstimate(
        [
          {
            name: 'Clerk',
            category: 'Auth',
            confidence: 'high',
            evidence: 'Detected',
          },
        ],
        { found: false },
        { score: 100, checks: [], summary: 'Perfect' }
      );
      expect(moderateResult.complexity).toBe('moderate');

      // Complex: 10 + 20 + 15 + 25 + 3 = 73
      const complexResult = await analyzeCloneEstimate(
        [
          {
            name: 'Clerk',
            category: 'Auth',
            confidence: 'high',
            evidence: 'Detected',
          },
          {
            name: 'Stripe',
            category: 'Payments',
            confidence: 'high',
            evidence: 'Detected',
          },
          {
            name: 'Firebase',
            category: 'Backend',
            confidence: 'high',
            evidence: 'Detected',
          },
          {
            name: 'Google Analytics',
            category: 'Analytics',
            confidence: 'high',
            evidence: 'Detected',
          },
        ],
        { found: false },
        { score: 100, checks: [], summary: 'Perfect' }
      );
      expect(complexResult.complexity).toBe('complex');
    });

    it('requiredSkills always includes HTML/CSS, JavaScript, TypeScript', async () => {
      const techStack: TechStackItem[] = [];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      expect(result.requiredSkills).toContain('HTML/CSS');
      expect(result.requiredSkills).toContain('JavaScript');
      expect(result.requiredSkills).toContain('TypeScript');
    });

    it('Next.js framework adds React and Next.js to requiredSkills', async () => {
      const techStack: TechStackItem[] = [
        {
          name: 'Next.js',
          category: 'Framework',
          confidence: 'high',
          evidence: 'Detected',
        },
      ];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      expect(result.requiredSkills).toContain('React');
      expect(result.requiredSkills).toContain('Next.js');
    });

    it('similarOpenSource populated based on detected features', async () => {
      const techStack: TechStackItem[] = [
        {
          name: 'Clerk',
          category: 'Auth',
          confidence: 'high',
          evidence: 'Detected',
        },
        {
          name: 'Stripe',
          category: 'Payments',
          confidence: 'high',
          evidence: 'Detected',
        },
        {
          name: 'Firebase',
          category: 'Backend',
          confidence: 'high',
          evidence: 'Detected',
        },
      ];
      const pricing: PricingAnalysis = { found: false };
      const seo: SEOAudit = { score: 100, checks: [], summary: 'Perfect' };

      const result = await analyzeCloneEstimate(techStack, pricing, seo);
      expect(result.similarOpenSource.length).toBeGreaterThan(0);
      expect(result.similarOpenSource[0]).toContain('saas');
    });
  });
});
