import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeSEO } from '@/lib/analyzer/seo';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('seo', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Default: robots.txt and sitemap.xml not found
    mockFetch.mockResolvedValue({ ok: false, text: async () => '' });
  });

  describe('analyzeSEO', () => {
    it('analyzes comprehensive SEO with multiple elements', async () => {
      const html = `
        <html>
          <head>
            <title>Perfect Page Title For SEO</title>
            <meta name="description" content="This is a perfect meta description that is between 120 and 160 characters for optimal SEO purpose here.">
            <link rel="canonical" href="https://example.com">
            <meta property="og:title" content="OG Title">
            <meta property="og:description" content="OG Description">
            <meta property="og:image" content="https://example.com/og-image.jpg">
            <meta name="twitter:card" content="summary_large_image">
            <h1>Main Heading</h1>
            <h2>Subheading 1</h2>
            <h3>Subheading 2</h3>
          </head>
        </html>
      `;
      const result = await analyzeSEO(html, 'https://example.com');
      // Should have all checks
      expect(result.checks.length).toBe(10);
      // Should have a score
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      // Verify summary is present
      expect(result.summary).toBeDefined();
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('returns low score for empty HTML', async () => {
      const html = '<html></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      expect(result.score).toBeLessThan(50);
    });

    it('fails Title Tag check when title is too short (<30 chars)', async () => {
      const html = '<html><head><title>Short</title></head></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      const titleCheck = result.checks.find((c) => c.name === 'Title Tag');
      expect(titleCheck?.passed).toBe(false);
    });

    it('fails Title Tag check when title is too long (>60 chars)', async () => {
      const html =
        '<html><head><title>This is a very long title that exceeds the maximum recommended length for SEO</title></head></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      const titleCheck = result.checks.find((c) => c.name === 'Title Tag');
      expect(titleCheck?.passed).toBe(false);
    });

    it('fails Meta Description check when missing', async () => {
      const html = '<html><head><title>Good Title Here</title></head></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      const descCheck = result.checks.find((c) => c.name === 'Meta Description');
      expect(descCheck?.passed).toBe(false);
    });

    it('fails H1 Tag check when multiple H1 tags present', async () => {
      const html = '<html><body><h1>First</h1><h1>Second</h1></body></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      const h1Check = result.checks.find((c) => c.name === 'H1 Tag');
      expect(h1Check?.passed).toBe(false);
    });

    it('fails H1 Tag check when no H1 tag present', async () => {
      const html = '<html><body><h2>Heading</h2></body></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      const h1Check = result.checks.find((c) => c.name === 'H1 Tag');
      expect(h1Check?.passed).toBe(false);
    });

    it('fails Robots Meta check when noindex is set', async () => {
      const html =
        '<html><head><meta name="robots" content="noindex, follow"></head></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      const robotsCheck = result.checks.find((c) => c.name === 'Robots Meta');
      expect(robotsCheck?.passed).toBe(false);
    });

    it('includes check names and recommendations in results', async () => {
      const html = `
        <html>
          <head>
            <title>Perfect Page Title For SEO</title>
            <meta name="description" content="This is a perfect meta description that is between 120 and 160 characters for optimal SEO purpose here.">
            <link rel="canonical" href="https://example.com">
            <meta property="og:title" content="OG Title">
            <meta property="og:description" content="OG Description">
            <meta property="og:image" content="https://example.com/og-image.jpg">
            <meta name="twitter:card" content="summary_large_image">
            <h1>Main Heading</h1>
            <h2>Subheading</h2>
          </head>
        </html>
      `;
      const result = await analyzeSEO(html, 'https://example.com');
      // Verify checks have proper structure
      result.checks.forEach((check) => {
        expect(check.name).toBeDefined();
        expect(typeof check.passed).toBe('boolean');
        expect(check.recommendation).toBeDefined();
      });
      // Verify we have checks for key SEO areas
      const checkNames = result.checks.map((c) => c.name);
      expect(checkNames).toContain('Title Tag');
      expect(checkNames).toContain('Meta Description');
      expect(checkNames).toContain('H1 Tag');
      expect(checkNames).toContain('Canonical Tag');
    });

    it('returns "Poor" summary for very low scores', async () => {
      const html = '<html><body>No SEO</body></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      expect(result.summary).toContain('Poor');
    });

    it('returns exactly 10 checks', async () => {
      const html = '<html></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      expect(result.checks.length).toBe(10);
    });

    it('returns score between 0 and 100', async () => {
      const html = '<html><head><title>Test</title></head></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('passes Canonical Tag check when canonical link is present', async () => {
      const html =
        '<html><head><link rel="canonical" href="https://example.com"></head></html>';
      const result = await analyzeSEO(html, 'https://example.com');
      const canonicalCheck = result.checks.find((c) => c.name === 'Canonical Tag');
      expect(canonicalCheck?.passed).toBe(true);
    });

    it('passes Open Graph Tags check when at least 2 tags present', async () => {
      const html = `
        <html>
          <head>
            <meta property="og:title" content="OG Title">
            <meta property="og:description" content="OG Description">
          </head>
        </html>
      `;
      const result = await analyzeSEO(html, 'https://example.com');
      const ogCheck = result.checks.find((c) => c.name === 'Open Graph Tags');
      expect(ogCheck?.passed).toBe(true);
    });
  });
});
