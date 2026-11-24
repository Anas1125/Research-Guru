import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet} from '../functions/sitemap.xml.js';
import {apiOrigin} from '../functions/_seo-api.js';

const env = {VITE_API_URL:'https://backend.example'};
test('SEO origin validates configured HTTPS origin and trims whitespace',()=>{
  assert.equal(apiOrigin({VITE_API_URL:' https://backend.example/ '}),'https://backend.example');
  assert.throws(()=>apiOrigin({VITE_API_URL:'https://backend.example/api'}));
});
test('sitemap handles an empty published list with HTTP 200',async t=>{
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.equal(url,'https://backend.example/api/seo/posts');
    assert.equal(options.redirect,'manual');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json([]);
  });
  const response=await onRequestGet({env});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('x-seo-source'),'live');
  assert.equal(((await response.text()).match(/<loc>/g)||[]).length,8);
});
test('sitemap includes published slugs',async t=>{
  t.mock.method(globalThis,'fetch',async()=>Response.json(['research-methods']));
  const response=await onRequestGet({env});
  assert.equal(response.status,200);
  assert.match(await response.text(),/\/blog\/research-methods/);
});
test('sitemap rejects upstream redirects',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:302,headers:{Location:'https://other.example'}}));
  const response=await onRequestGet({env});
  assert.equal(response.status,503);
  assert.equal(response.headers.get('x-seo-error'),'upstream-redirect');
});
test('sitemap reports upstream HTTP errors without exposing body',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('private error detail',{status:403}));
  const response=await onRequestGet({env});
  assert.equal(response.status,503);
  assert.equal(response.headers.get('x-seo-error'),'upstream-http-403');
  assert.doesNotMatch(await response.text(),/private error detail/);
});
test('sitemap rejects non-JSON response',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('<html>login</html>'));
  const response=await onRequestGet({env});
  assert.equal(response.status,503);
  assert.equal(response.headers.get('x-seo-error'),'invalid-upstream-json');
});
test('sitemap reports invalid runtime configuration',async()=>{
  const response=await onRequestGet({env:{VITE_API_URL:'https://backend.example/api'}});
  assert.equal(response.status,503);
  assert.equal(response.headers.get('x-seo-error'),'invalid-api-origin');
});
