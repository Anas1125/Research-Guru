import { sitemapXml } from '../src/utils/seo.js';
import { seoFetch, SeoError } from './_seo-api.js';
export async function onRequestGet({env}) {
  try {
    const response = await seoFetch(env, '/api/seo/posts');
    if (!response.ok) throw new SeoError('upstream-http-'+response.status);
    let slugs;
    try { slugs = await response.json(); } catch { throw new SeoError('invalid-upstream-json'); }
    if (!Array.isArray(slugs) || !slugs.every(slug => typeof slug === 'string')) throw new SeoError('invalid-sitemap-response');
    return new Response(sitemapXml(slugs), {headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff','X-SEO-Source':'live'}});
  } catch (error) {
    const code = error instanceof SeoError ? error.code : 'sitemap-failed';
    console.warn('Sitemap generation failed:', code);
    return new Response(sitemapXml(), {status:503,headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store','Retry-After':'300','X-Content-Type-Options':'nosniff','X-SEO-Source':'fallback','X-SEO-Error':code}});
  }
}
