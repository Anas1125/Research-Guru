// Use a fixed, trusted API origin; never derive it from a browser header or query.
export function apiOrigin(env) {
  const url = new URL(env.VITE_API_URL || 'https://research-guru-nu.vercel.app');
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Invalid SEO API origin');
  return url.origin;
}
export async function seoFetch(env, path) {
  return fetch(apiOrigin(env)+path, {headers:{Accept:'application/json'}, redirect:'error', signal:AbortSignal.timeout(6000)});
}
