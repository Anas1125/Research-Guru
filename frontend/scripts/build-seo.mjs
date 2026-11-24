import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PUBLIC_PAGES, PRIVATE_PAGES, pageSeo, replaceSeo, sitemapXml, SITE_URL } from '../src/utils/seo.js';
export async function buildSeo(dir = 'dist') {
  const template = await readFile(join(dir, 'index.html'), 'utf8');
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
