import { apiOrigin } from '../_seo-api.js';

const FRONTENDS = new Set(['https://research-guru.pages.dev', 'https://researchguruglobal.com']);
const COOKIE = '__Host-rg-session';
const AUTH_PATHS = new Set(['/api/auth/session/login', '/api/auth/session/me', '/api/auth/session/logout']);
const METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']);

function reject(status, detail) {
  return Response.json({detail}, {status, headers:{'Cache-Control':'no-store'}});
}

export async function onRequest({request, env}) {
  const url = new URL(request.url);
  if (!FRONTENDS.has(url.origin)) return reject(403, 'Production origin required');
  if (!AUTH_PATHS.has(url.pathname) && !url.pathname.startsWith('/api/admin/')) return reject(404, 'Not found');
  if (!METHODS.has(request.method)) return reject(405, 'Method not allowed');
  const unsafe = !['GET','HEAD'].includes(request.method);
  if (unsafe && (request.headers.get('origin') !== url.origin || request.headers.get('x-rg-csrf') !== '1')) {
    return reject(403, 'Invalid request origin');
  }
  const secret = env.ADMIN_PROXY_SECRET;
  if (typeof secret !== 'string' || secret.length < 32) return reject(503, 'Session proxy unavailable');
  const headers = new Headers({'Accept':'application/json','X-RG-Proxy-Secret':secret});
  for (const name of ['Content-Type','Origin','X-RG-CSRF']) {
    const value = request.headers.get(name);
    if (value) headers.set(name,value);
  }
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) headers.set('X-RG-Client-IP',ip);
  const cookie = (request.headers.get('Cookie') || '').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='));
  if (cookie) headers.set('Cookie',cookie);
  try {
    const upstream = await fetch(apiOrigin(env)+url.pathname+url.search,{
      method:request.method, headers, body:unsafe ? request.body : undefined, redirect:'manual',
    });
    if (upstream.status >= 300 && upstream.status < 400) return reject(502,'Unexpected backend redirect');
    const out = new Headers({'Cache-Control':'no-store'});
    for (const name of ['Content-Type','Retry-After','WWW-Authenticate']) {
      const value = upstream.headers.get(name);
      if (value) out.set(name,value);
    }
    // The backend issues exactly one session cookie; never relay arbitrary cookies.
    const cookies = typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie() : [upstream.headers.get('Set-Cookie')];
    for (const value of cookies) {
      if (value?.startsWith(COOKIE+'=')) out.append('Set-Cookie',value);
    }
    return new Response(upstream.body,{status:upstream.status,headers:out});
  } catch {
    return reject(502,'Session backend unavailable');
  }
}
