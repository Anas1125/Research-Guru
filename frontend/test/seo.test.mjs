import test from 'node:test';
import assert from 'node:assert/strict';
import {pageSeo, articleSeo, renderSeo, replaceSeo, sitemapXml, PRIVATE_PAGES, SITE_URL} from '../src/utils/seo.js';
test('public pages have canonical origin and distinct metadata',()=>{
  assert.equal(pageSeo('/about/').url,SITE_URL+'/about');
  assert.notEqual(pageSeo('/about').title,pageSeo('/').title);
});
test('private, unknown and unverified articles are noindex',()=>{
  for(const path of [...PRIVATE_PAGES,'/admin/unknown','/missing','/blog/draft']){
    assert.equal(pageSeo(path).robots,'noindex, nofollow');
    assert.equal(pageSeo(path).url,undefined);
  }
});
test('published article metadata escapes HTML and JSON-LD',()=>{
  const html=renderSeo(articleSeo({slug:'example',title:'</script><script>alert(1)</script>',excerpt:'" & <'},'https://api.example'));
  assert.ok(!html.includes('<script>alert(1)'));
  assert.ok(html.includes('&lt;/script&gt;'));
  assert.ok(html.includes('\\u003c/script>'));
});
test('sitemap encodes and deduplicates valid slugs',()=>{
  const xml=sitemapXml(['a & b','a & b','../admin','..','/admin',null]);
  assert.equal((xml.match(/<loc>/g)||[]).length,9);
  assert.ok(xml.includes('/blog/a%20%26%20b'));
  assert.ok(!xml.includes('/admin'));
});
test('template replacement preserves site verification',()=>{
  const html=replaceSeo('<meta name="google-site-verification" content="example"><!-- RG SEO START -->old<!-- RG SEO END -->',pageSeo('/contact'));
  assert.ok(html.includes('google-site-verification'));
  assert.ok(html.includes(SITE_URL+'/contact'));
  assert.ok(!html.includes('>old<'));
});
