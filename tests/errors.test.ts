import { describe, it, expect } from 'vitest';
import { getUserFriendlyError, formatStreamError } from '@/lib/errors';

describe('errors', () => {
  describe('getUserFriendlyError', () => {
    it('maps timeout errors to TIMEOUT code', () => {
      const error = new Error('Request timeout');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('TIMEOUT');
      expect(result.title).toBe('Connection Timed Out');
    });

    it('maps network errors to NETWORK_ERROR code', () => {
      const error = new Error('Network request failed');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.title).toBe('Could Not Reach Website');
    });

    it('maps fetch errors to NETWORK_ERROR code', () => {
      const error = new Error('Failed to fetch');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('NETWORK_ERROR');
    });

    it('maps HTTP 403 forbidden to BLOCKED code', () => {
      const error = new Error('HTTP 403 Forbidden');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('BLOCKED');
      expect(result.title).toBe('Access Blocked');
    });

    it('maps HTTP 404 not found to NOT_FOUND code', () => {
      const error = new Error('HTTP 404 Not Found');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('NOT_FOUND');
      expect(result.title).toBe('Page Not Found');
    });

    it('maps HTTP 5xx server errors to SERVER_ERROR code', () => {
      const error = new Error('HTTP 500 Internal Server Error');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('SERVER_ERROR');
      expect(result.title).toBe('Website Error');
    });

    it('maps SSL errors to SSL_ERROR code', () => {
      const error = new Error('SSL certificate validation failed');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('SSL_ERROR');
      expect(result.title).toBe('Security Certificate Issue');
    });

    it('maps rate limit errors to RATE_LIMIT code', () => {
      const error = new Error('Rate limit exceeded');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('RATE_LIMIT');
      expect(result.title).toBe('Rate Limit Reached');
    });

    it('maps cloudflare/captcha errors to BOT_PROTECTION code', () => {
      const error = new Error('Cloudflare challenge detected');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('BOT_PROTECTION');
      expect(result.title).toBe('Bot Protection Detected');
    });

    it('maps invalid URL errors to INVALID_URL code', () => {
      const error = new Error('Invalid URL format');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('INVALID_URL');
      expect(result.title).toBe('Invalid URL');
    });

    it('maps unknown errors to UNKNOWN code with default message', () => {
      const error = new Error('Some random error');
      const result = getUserFriendlyError(error);
      expect(result.code).toBe('UNKNOWN');
      expect(result.title).toBe('Analysis Failed');
    });

    it('includes context in default message when provided', () => {
      const error = new Error('Some random error');
      const result = getUserFriendlyError(error, 'analyzing the website');
      expect(result.message).toContain('analyzing the website');
    });

    it('handles non-Error objects (plain strings)', () => {
      const result = getUserFriendlyError('Something went wrong');
      expect(result.code).toBe('UNKNOWN');
      expect(result.title).toBe('Analysis Failed');
    });
  });

  describe('formatStreamError', () => {
    it('returns formatted error string combining title, message, and suggestion', () => {
      const error = new Error('HTTP 403 Forbidden');
      const formatted = formatStreamError(error);
      expect(formatted).toContain('Access Blocked');
      expect(formatted).toContain('blocked');
      expect(formatted).toContain('security');
    });

    it('includes context in formatted output when provided', () => {
      const error = new Error('Something went wrong');
      const formatted = formatStreamError(error, 'fetching content');
      expect(formatted).toContain('fetching content');
    });

    it('formats timeout errors with full message', () => {
      const error = new Error('Request timeout');
      const formatted = formatStreamError(error);
      expect(formatted).toContain('Connection Timed Out');
      expect(formatted).toContain('website took too long');
    });
  });
});
