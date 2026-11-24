import { sitemapXml } from '../src/utils/seo.js';
import { seoFetch } from './_seo-api.js';
export async function onRequestGet({env}) {
  try {
    const response = await seoFetch(env, '/api/seo/posts');
    if (!response.ok) throw new Error('Sitemap API unavailable');
    const slugs = await response.json();
    if (!Array.isArray(slugs)) throw new Error('Invalid sitemap response');
    return new Response(sitemapXml(slugs), {headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
  } catch {
    return new Response(sitemapXml(), {status:503,headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store','Retry-After':'300','X-Content-Type-Options':'nosniff'}});
  }
}
