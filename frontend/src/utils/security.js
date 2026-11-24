const DEFAULT_API = 'https://research-guru-nu.vercel.app';

export function trustedApiOrigin(value = DEFAULT_API) {
  const url = new URL(value.trim() || DEFAULT_API);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_API_URL must be a bare HTTPS origin for production CSP');
  }
  return url.origin;
}

export function securityHeaders(env = {}) {
  const api = trustedApiOrigin(env.VITE_API_URL);
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' " + api,
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
    "worker-src 'none'",
    "manifest-src 'self'",
  ].join('; ') + ';';

  return {
    [env.VITE_CSP_ENFORCE === 'true' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only']: policy,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  };
}
