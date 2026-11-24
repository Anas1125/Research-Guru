// Use a fixed, trusted API origin; never derive it from a browser header or query.
export class SeoError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
export function apiOrigin(env) {
  try {
    const url = new URL((env.VITE_API_URL || 'https://research-guru-nu.vercel.app').trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
    return url.origin;
  } catch {
    throw new SeoError('invalid-api-origin');
  }
}
export async function seoFetch(env, path) {
  const target = apiOrigin(env)+path;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    // Workers does not support redirect: 'error'. Reject redirects explicitly instead.
    const response = await fetch(target, {headers:{Accept:'application/json'}, redirect:'manual', signal:controller.signal});
    if (response.status >= 300 && response.status < 400) throw new SeoError('upstream-redirect');
    return response;
  } catch (error) {
    if (error instanceof SeoError) throw error;
    throw new SeoError(controller.signal.aborted ? 'upstream-timeout' : 'upstream-fetch-failed');
  } finally {
    clearTimeout(timer);
  }
}
