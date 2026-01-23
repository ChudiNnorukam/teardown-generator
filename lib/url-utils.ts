// URL validation and normalization utilities

export interface URLValidationResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
  domain?: string;
}

export function validateAndNormalizeUrl(url: string): URLValidationResult {
  // Basic string validation
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Add https:// if no protocol specified
  let urlWithProtocol = trimmedUrl;
  if (!/^https?:\/\//i.test(urlWithProtocol)) {
    urlWithProtocol = `https://${urlWithProtocol}`;
  }

  // Parse URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlWithProtocol);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Validate protocol
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are supported' };
  }

  // Validate not localhost
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  ) {
    return { valid: false, error: 'Local URLs are not supported' };
  }

  // Validate not IP address (simple check)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { valid: false, error: 'IP addresses are not supported. Please use a domain name.' };
  }

  // Validate has valid TLD
  if (!hostname.includes('.')) {
    return { valid: false, error: 'URL must have a valid domain with TLD' };
  }

  // Normalize: remove trailing slash, lowercase domain
  const normalizedUrl = `${parsedUrl.protocol}//${hostname}${parsedUrl.pathname.replace(/\/$/, '')}${parsedUrl.search}`;

  return {
    valid: true,
    normalizedUrl,
    domain: hostname,
  };
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return '';
  }
}
