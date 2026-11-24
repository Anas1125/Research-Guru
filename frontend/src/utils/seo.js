// One canonical production origin; update this when moving to a custom domain.
export const SITE_URL = 'https://research-guru.pages.dev';
export const DEFAULT_IMAGE = SITE_URL + '/og-image.png';
const brand = 'Research Guru';
export const PUBLIC_PAGES = {
  '/': ['Research Guru | Research & PhD Support', 'Research Guru provides research, PhD, technical implementation, academic writing, thesis and publication support.'],
  '/about': ['About Us | Research Guru', 'Learn about Research Guru and our approach to supporting scholars, researchers and PhD candidates.'],
  '/services': ['Research Services | Research Guru', 'Explore research implementation, academic writing, thesis and publication support services.'],
  '/contact': ['Contact Us | Research Guru', 'Contact Research Guru for research, PhD, thesis, publication and technical implementation support.'],
  '/blog': ['Research Blog | Research Guru', 'Explore research guidance, academic insights and practical perspectives for scholars.'],
  '/offers': ['Research Offers | Research Guru', 'Explore current research, academic, PhD, thesis and technical support offers.'],
  '/privacy-policy': ['Privacy Policy | Research Guru', 'Learn how Research Guru collects, uses and protects information submitted through the website.'],
  '/terms-and-conditions': ['Terms & Conditions | Research Guru', 'Read the terms governing website use, enquiries, services and intellectual property.'],
};
export const PRIVATE_PAGES = ['/login', '/admin', '/admin/login', '/admin/blog', '/admin/users', '/admin/contact', '/admin/services', '/admin/settings', '/admin/reviews', '/admin/clients', '/admin/offers'];

export const normalizePath = path => path.replace(/\/+$/, '') || '/';
export const isPrivate = path => path === '/login' || path === '/admin' || path.startsWith('/admin/');
export function noIndex(title = 'Page Not Found | Research Guru', description = '') {
  return { title, description, robots: 'noindex, nofollow' };
}
export function pageSeo(rawPath) {
  const path = normalizePath(rawPath);
  if (Object.hasOwn(PUBLIC_PAGES, path)) {
    const [title, description] = PUBLIC_PAGES[path];
    const url = SITE_URL + path;
    const schema = path === '/' ? {
      '@context': 'https://schema.org', '@graph': [
        { '@type': 'Organization', '@id': SITE_URL + '/#organization', name: brand, url: SITE_URL + '/' },
        { '@type': 'WebSite', '@id': SITE_URL + '/#website', name: brand, url: SITE_URL + '/', publisher: { '@id': SITE_URL + '/#organization' } },
      ],
    } : undefined;
    return {title, description, robots: 'index, follow', url, image: DEFAULT_IMAGE, type: 'website', schema};
  }
  if (isPrivate(path)) return noIndex('Admin | Research Guru');
  if (path.startsWith('/blog/')) return noIndex('Research Article | Research Guru');
  return noIndex();
}
export function slugPath(slug) {
  if (typeof slug !== 'string' || !slug.trim() || slug === '.' || slug === '..' || /[\\/]/.test(slug) || slug.length > 255) return null;
  try { return '/blog/' + encodeURIComponent(slug); } catch { return null; }
}
export function articleSeo(post, apiOrigin) {
  const path = slugPath(post.slug);
  if (!path || typeof post.title !== 'string' || !post.title.trim()) return noIndex();
  const url = SITE_URL + path;
  const title = post.title + ' | Research Guru';
  const description = (typeof post.excerpt === 'string' && post.excerpt.trim()) || 'Research guidance and academic insights from Research Guru.';
  let image = DEFAULT_IMAGE;
  try {
    if (typeof post.featured_image === 'string' && post.featured_image) {
      const candidate = new URL(post.featured_image, apiOrigin);
      if (candidate.protocol === 'https:' && !candidate.username && !candidate.password) image = candidate.href;
    }
  } catch { /* retain default image */ }
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description, url, image: [image], publisher: {'@type': 'Organization', name: brand, url: SITE_URL + '/'} };
  if (post.published_at && !Number.isNaN(Date.parse(post.published_at))) schema.datePublished = post.published_at;
  return {title, description, robots: 'index, follow', url, image, type: 'article', schema};
}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
function tags(meta) {
  const items = [['title', {}, meta.title], ['meta', {name:'description', content:meta.description}], ['meta', {name:'robots', content:meta.robots}]];
  if (meta.url) {
    items.push(['link', {rel:'canonical', href:meta.url}]);
    for (const [key, value] of Object.entries({title:meta.title, description:meta.description, type:meta.type, url:meta.url, image:meta.image})) items.push(['meta', {property:'og:'+key, content:value}]);
    for (const [key,value] of Object.entries({card:'summary_large_image', title:meta.title, description:meta.description, image:meta.image})) items.push(['meta', {name:'twitter:'+key, content:value}]);
  }
  if (meta.schema) items.push(['script', {type:'application/ld+json'}, JSON.stringify(meta.schema).replace(/</g, '\\u003c')]);
  return items;
}
export function renderSeo(meta) {
  return tags(meta).map(([tag, attrs, content]) => {
    const attributes = ' data-rg-seo' + Object.entries(attrs).map(([key,value]) => ' '+key+'="'+escapeHtml(value)+'"').join('');
    if (tag === 'meta' || tag === 'link') return '<'+tag+attributes+'>';
    return '<'+tag+attributes+'>'+(tag === 'script' ? content : escapeHtml(content))+'</'+tag+'>';
  }).join('\n');
}
export function replaceSeo(html, meta) {
  const marker = /<!-- RG SEO START -->[\s\S]*?<!-- RG SEO END -->/;
  if (!marker.test(html)) throw new Error('SEO template markers missing');
  return html.replace(marker, () => '<!-- RG SEO START -->\n'+renderSeo(meta)+'\n<!-- RG SEO END -->');
}
export function applySeo(meta) {
  document.head.querySelectorAll('[data-rg-seo]').forEach(node => node.remove());
  for (const [tag, attrs, content] of tags(meta)) {
    const node = document.createElement(tag);
    node.setAttribute('data-rg-seo','');
    for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
    if (content !== undefined) node.textContent = content;
    document.head.appendChild(node);
  }
}
export function sitemapXml(slugs = []) {
  const urls = new Set(Object.keys(PUBLIC_PAGES).map(path => SITE_URL+path));
  for (const slug of slugs) {
    const path = slugPath(slug);
    if (path) urls.add(SITE_URL+path);
    if (urls.size >= 50000) break;
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+[...urls].map(url => '  <url><loc>'+escapeHtml(url)+'</loc></url>').join('\n')+'\n</urlset>\n';
}
