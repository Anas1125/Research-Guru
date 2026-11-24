import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PUBLIC_PAGES, PRIVATE_PAGES, pageSeo, replaceSeo, sitemapXml, SITE_URL } from '../src/utils/seo.js';
export async function buildSeo(dir = 'dist') {
  let template = await readFile(join(dir, 'index.html'), 'utf8');
  // Vite may strip HTML comments. Restore the marker around the known initial tags.
  if (!template.includes('<!-- RG SEO START -->')) {
    const initial = /<title\b[^>]*data-rg-seo[^>]*>[\s\S]*?<\/title>\s*<meta\b[^>]*data-rg-seo[^>]*>\s*<meta\b[^>]*data-rg-seo[^>]*>/i;
    if (!initial.test(template)) throw new Error('Initial SEO tags missing');
    template = template.replace(initial, value => '<!-- RG SEO START -->'+value+'<!-- RG SEO END -->');
  }
  for (const path of [...Object.keys(PUBLIC_PAGES), ...PRIVATE_PAGES]) {
    const folder = join(dir, path.slice(1));
    await mkdir(folder, {recursive: true});
    await writeFile(join(folder, 'index.html'), replaceSeo(template, pageSeo(path)));
  }
  await writeFile(join(dir,'404.html'), replaceSeo(template, pageSeo('/not-found')));
  await writeFile(join(dir,'sitemap.xml'), sitemapXml());
  await writeFile(join(dir,'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: '+SITE_URL+'/sitemap.xml\n');
  console.log('SEO: static route metadata, admin noindex, 404 and fallback sitemap generated.');
}
await buildSeo();
