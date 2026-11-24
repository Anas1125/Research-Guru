import { articleSeo, noIndex, replaceSeo, slugPath } from '../../src/utils/seo.js';
import { apiOrigin, seoFetch } from '../_seo-api.js';
export async function onRequestGet({request,env}) {
  let status = 503;
  let meta = noIndex('Article Unavailable | Research Guru');
  try {
    const slug = decodeURIComponent(new URL(request.url).pathname.replace(/^\/blog\//,'').replace(/\/$/,''));
    if (!slugPath(slug)) {
      status = 404; meta = noIndex('Article Not Found | Research Guru');
    } else {
      const response = await seoFetch(env, '/api/blog/'+encodeURIComponent(slug));
      if (response.status === 404) {
        status = 404; meta = noIndex('Article Not Found | Research Guru');
      } else if (response.ok) {
        const post = await response.json();
        if (post.slug !== slug || post.is_published !== true) throw new Error('Unexpected article');
        meta = articleSeo(post,apiOrigin(env));
        if (!meta.url) throw new Error('Invalid article');
        status = 200;
      }
    }
  } catch { /* temporary errors must not be indexed */ }
  const asset = await env.ASSETS.fetch(new URL('/',request.url));
  const headers = new Headers(asset.headers);
  for (const key of ['content-length','content-encoding','etag','last-modified']) headers.delete(key);
  headers.set('Content-Type','text/html; charset=utf-8');
  headers.set('Cache-Control','no-store');
  headers.set('X-Content-Type-Options','nosniff');
  if (status !== 200) headers.set('X-Robots-Tag','noindex, nofollow');
  if (status === 503) headers.set('Retry-After','60');
  return new Response(replaceSeo(await asset.text(),meta), {status,headers});
}
