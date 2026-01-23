/**
 * User-friendly error messages
 *
 * Every error should answer:
 * 1. WHAT happened?
 * 2. WHY did it happen?
 * 3. What can the user DO about it?
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion: string;
  code: string;
}

/**
 * Map internal error messages to user-friendly versions
 */
export function getUserFriendlyError(error: unknown, context?: string): UserFriendlyError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();

  // Network/Timeout errors
  if (errorLower.includes('timeout') || errorLower.includes('abort')) {
    return {
      title: 'Connection Timed Out',
      message: 'The website took too long to respond.',
      suggestion: 'The site may be slow or blocking automated requests. Try again in a few minutes, or try a different page on the same site.',
      code: 'TIMEOUT',
    };
  }

  if (errorLower.includes('fetch') || errorLower.includes('network') || errorLower.includes('enotfound')) {
    return {
      title: 'Could Not Reach Website',
      message: 'We couldn\'t connect to the website.',
      suggestion: 'Check the URL is correct and the site is online. Some sites block automated access.',
      code: 'NETWORK_ERROR',
    };
  }

  // HTTP errors
  if (errorLower.includes('http 403') || errorLower.includes('forbidden')) {
    return {
      title: 'Access Blocked',
      message: 'The website blocked our request.',
      suggestion: 'This site has security measures that prevent analysis. Try the main homepage instead of a subpage, or report this site for manual review.',
      code: 'BLOCKED',
    };
  }

  if (errorLower.includes('http 404') || errorLower.includes('not found')) {
    return {
      title: 'Page Not Found',
      message: 'The URL you entered doesn\'t exist.',
      suggestion: 'Double-check the URL for typos. Make sure you\'re using the full URL including https://.',
      code: 'NOT_FOUND',
    };
  }

  if (errorLower.includes('http 5')) {
    return {
      title: 'Website Error',
      message: 'The website itself is having issues.',
      suggestion: 'The site may be down or experiencing problems. Try again later.',
      code: 'SERVER_ERROR',
    };
  }

  // SSL/Certificate errors
  if (errorLower.includes('ssl') || errorLower.includes('certificate') || errorLower.includes('cert')) {
    return {
      title: 'Security Certificate Issue',
      message: 'The website has an invalid security certificate.',
      suggestion: 'We can\'t safely analyze sites with certificate problems. Try a different URL.',
      code: 'SSL_ERROR',
    };
  }

  // Rate limiting
  if (errorLower.includes('rate limit') || errorLower.includes('too many')) {
    return {
      title: 'Rate Limit Reached',
      message: 'You\'ve used your daily analyses.',
      suggestion: 'Sign in to get 10 free analyses per day, or upgrade to Pro for unlimited.',
      code: 'RATE_LIMIT',
    };
  }

  // Cloudflare/Bot protection
  if (errorLower.includes('cloudflare') || errorLower.includes('challenge') || errorLower.includes('captcha')) {
    return {
      title: 'Bot Protection Detected',
      message: 'This site uses advanced bot protection.',
      suggestion: 'Some sites require human verification that we can\'t bypass. Try the main domain instead of a specific page.',
      code: 'BOT_PROTECTION',
    };
  }

  // Invalid URL
  if (errorLower.includes('invalid url') || errorLower.includes('url') && errorLower.includes('invalid')) {
    return {
      title: 'Invalid URL',
      message: 'The URL format is incorrect.',
      suggestion: 'Make sure to include the full URL with https:// (e.g., https://example.com).',
      code: 'INVALID_URL',
    };
  }

  // Default fallback with context
  return {
    title: 'Analysis Failed',
    message: context
      ? `Something went wrong while ${context}.`
      : 'Something went wrong during analysis.',
    suggestion: 'Try again with a different URL. If the problem persists, the site may not be compatible with our analyzer.',
    code: 'UNKNOWN',
  };
}

/**
 * Format error for streaming response
 */
export function formatStreamError(error: unknown, context?: string): string {
  const friendly = getUserFriendlyError(error, context);
  return `${friendly.title}: ${friendly.message} ${friendly.suggestion}`;
}

/**
 * Error codes for analytics/debugging
 */
export const ERROR_CODES = {
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  BLOCKED: 'BLOCKED',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  SSL_ERROR: 'SSL_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  BOT_PROTECTION: 'BOT_PROTECTION',
  INVALID_URL: 'INVALID_URL',
  UNKNOWN: 'UNKNOWN',
} as const;
