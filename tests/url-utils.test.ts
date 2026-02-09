import { describe, it, expect } from 'vitest';
import { validateAndNormalizeUrl, extractDomain } from '@/lib/url-utils';

describe('url-utils', () => {
  describe('validateAndNormalizeUrl', () => {
    it('returns valid=true for valid URLs with https protocol', () => {
      const result = validateAndNormalizeUrl('https://example.com');
      expect(result.valid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com');
      expect(result.domain).toBe('example.com');
    });

    it('adds https:// when protocol is missing', () => {
      const result = validateAndNormalizeUrl('example.com');
      expect(result.valid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com');
      expect(result.domain).toBe('example.com');
    });

    it('returns valid=false for empty string', () => {
      const result = validateAndNormalizeUrl('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL is required');
    });

    it('returns valid=false for null/undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultNull = validateAndNormalizeUrl(null as any);
      expect(resultNull.valid).toBe(false);
      expect(resultNull.error).toBe('URL is required');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultUndefined = validateAndNormalizeUrl(undefined as any);
      expect(resultUndefined.valid).toBe(false);
    });

    it('blocks localhost', () => {
      const result = validateAndNormalizeUrl('http://localhost:3000');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Local URLs are not supported');
    });

    it('blocks 127.0.0.1', () => {
      const result = validateAndNormalizeUrl('http://127.0.0.1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Local URLs are not supported');
    });

    it('blocks 192.168.x.x private IPs', () => {
      const result = validateAndNormalizeUrl('http://192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Local URLs are not supported');
    });

    it('blocks 10.x.x.x private IPs', () => {
      const result = validateAndNormalizeUrl('http://10.0.0.1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Local URLs are not supported');
    });

    it('blocks bare IP addresses like 8.8.8.8', () => {
      const result = validateAndNormalizeUrl('http://8.8.8.8');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('IP addresses are not supported. Please use a domain name.');
    });

    it('blocks URLs without TLD (just domain name)', () => {
      const result = validateAndNormalizeUrl('http://example');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL must have a valid domain with TLD');
    });

    it('normalizes URL to lowercase domain', () => {
      const result = validateAndNormalizeUrl('https://Example.COM/Path');
      expect(result.valid).toBe(true);
      expect(result.domain).toBe('example.com');
      expect(result.normalizedUrl).toContain('example.com');
    });

    it('removes trailing slash during normalization', () => {
      const result = validateAndNormalizeUrl('https://example.com/');
      expect(result.valid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com');
    });

    it('preserves non-trailing slashes and query strings', () => {
      const result = validateAndNormalizeUrl('https://example.com/path?query=value');
      expect(result.valid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com/path?query=value');
    });
  });

  describe('extractDomain', () => {
    it('returns hostname in lowercase for valid URLs', () => {
      const domain = extractDomain('https://Example.COM/path');
      expect(domain).toBe('example.com');
    });

    it('returns empty string for invalid URLs', () => {
      const domain = extractDomain('not a url');
      expect(domain).toBe('');
    });

    it('extracts domain from URLs with paths', () => {
      const domain = extractDomain('https://example.com/some/path');
      expect(domain).toBe('example.com');
    });

    it('extracts domain from URLs with query strings', () => {
      const domain = extractDomain('https://example.com?query=value');
      expect(domain).toBe('example.com');
    });

    it('extracts domain from URLs with subdomains', () => {
      const domain = extractDomain('https://subdomain.example.com');
      expect(domain).toBe('subdomain.example.com');
    });
  });
});
