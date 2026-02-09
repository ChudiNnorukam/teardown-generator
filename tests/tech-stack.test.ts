import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeTechStack } from '@/lib/analyzer/tech-stack';

// Mock the getTechEnrichment function
vi.mock('@/lib/analyzer/tech-enrichment', () => ({
  getTechEnrichment: vi.fn().mockResolvedValue([]),
}));

describe('tech-stack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeTechStack', () => {
    it('detects Next.js from __NEXT_DATA__ script tag', async () => {
      const html = '<script id="__NEXT_DATA__" type="application/json">{}</script>';
      const result = await analyzeTechStack(html, {});
      expect(result.some((t) => t.name === 'Next.js')).toBe(true);
    });

    it('detects Next.js from _next/ script references', async () => {
      const html = '<script src="/_next/static/chunks/main.js"></script>';
      const result = await analyzeTechStack(html, {});
      expect(result.some((t) => t.name === 'Next.js')).toBe(true);
    });

    it('detects React from data-reactroot attribute', async () => {
      const html = '<div id="root" data-reactroot></div>';
      const result = await analyzeTechStack(html, {});
      expect(result.some((t) => t.name === 'React')).toBe(true);
    });

    it('detects Vue from v-if directive', async () => {
      const html = '<div v-if="show">Content</div>';
      const result = await analyzeTechStack(html, {});
      expect(result.some((t) => t.name === 'Vue')).toBe(true);
    });

    it('detects Svelte from data-sveltekit attribute', async () => {
      const html = '<div data-sveltekit-hydrate="abc123">Content</div>';
      const result = await analyzeTechStack(html, {});
      expect(result.some((t) => t.name === 'Svelte')).toBe(true);
    });

    it('detects Tailwind CSS when 2+ patterns match', async () => {
      const html = `
        <div class="sm:flex md:grid lg:block hover:bg-blue">
          <p class="space-x-4 tracking-wider">Content</p>
        </div>
      `;
      const result = await analyzeTechStack(html, {});
      expect(result.some((t) => t.name === 'Tailwind CSS')).toBe(true);
    });

    it('detects Bootstrap from bootstrap.min.js script', async () => {
      const html = '<script src="bootstrap.min.js"></script>';
      const result = await analyzeTechStack(html, {});
      expect(result.some((t) => t.name === 'Bootstrap')).toBe(true);
    });

    it('detects Vercel from x-vercel-id header', async () => {
      const html = '';
      const headers = { 'x-vercel-id': 'sfo1::abc123' };
      const result = await analyzeTechStack(html, headers);
      expect(result.some((t) => t.name === 'Vercel')).toBe(true);
    });

    it('detects Google Analytics from gtag script', async () => {
      const html = '<script src="https://www.googletagmanager.com/gtag/js?id=GA-123"></script><script>window.gtag("config", "GA-123")</script>';
      const result = await analyzeTechStack(html, {});
      expect(result.some((t) => t.name === 'Google Analytics')).toBe(true);
    });

    it('detects Stripe from js.stripe.com script', async () => {
      const html = '<script src="https://js.stripe.com/v3/"></script>';
      const result = await analyzeTechStack(html, {});
      expect(result.some((t) => t.name === 'Stripe')).toBe(true);
    });

    it('infers React when Next.js is detected', async () => {
      const html = '<script id="__NEXT_DATA__" type="application/json">{}</script>';
      const result = await analyzeTechStack(html, {});
      const nextJs = result.find((t) => t.name === 'Next.js');
      const react = result.find((t) => t.name === 'React');
      expect(nextJs).toBeDefined();
      expect(react).toBeDefined();
      expect(react?.evidence).toContain('Inferred from Next.js');
    });

    it('returns empty array for plain HTML with no tech markers', async () => {
      const html = '<div><p>Hello world</p></div>';
      const result = await analyzeTechStack(html, {});
      expect(result).toEqual([]);
    });

    it('sorts results by category priority (Framework first)', async () => {
      const html = `
        <script id="__NEXT_DATA__" type="application/json">{}</script>
        <script src="https://js.stripe.com/v3/"></script>
        <div class="sm:flex md:grid">Content</div>
      `;
      const result = await analyzeTechStack(html, {});
      const categoryOrder = result.map((t) => t.category);
      expect(categoryOrder[0]).toBe('Framework');
    });

    it('assigns correct confidence levels to detections', async () => {
      const html = '<script id="__NEXT_DATA__" type="application/json">{}</script>';
      const result = await analyzeTechStack(html, {});
      const nextJs = result.find((t) => t.name === 'Next.js');
      expect(nextJs?.confidence).toBe('high');
    });
  });
});
