import test from 'node:test';
import assert from 'node:assert/strict';
import { securityHeaders, trustedApiOrigin } from '../src/utils/security.js';
import { onRequest } from '../functions/_middleware.js';

test('CSP defaults to report-only with restrictive executable sources',()=>{
  const headers=securityHeaders();
  const csp=headers['Content-Security-Policy-Report-Only'];
  assert.ok(csp);
  assert.equal(headers['Content-Security-Policy'],undefined);
  assert.match(csp,/script-src 'self';/);
  assert.match(csp,/frame-ancestors 'none'/);
  assert.match(csp,/object-src 'none'/);
  assert.match(csp,/connect-src 'self' https:\/\/research-guru-nu.vercel.app;/);
  assert.doesNotMatch(csp,/unsafe-eval/);
});
test('enforcement is explicit and uses configured API origin',()=>{
  const headers=securityHeaders({VITE_CSP_ENFORCE:'true',VITE_API_URL:'https://backend.example/'});
  assert.match(headers['Content-Security-Policy'],/connect-src 'self' https:\/\/backend.example;/);
  assert.equal(headers['Content-Security-Policy-Report-Only'],undefined);
});
test('API origin cannot inject directives or use insecure HTTP',()=>{
  for(const url of ['http://backend.example','https://backend.example/api','https://user:pass@backend.example','https://backend.example/?x=1','https://backend.example; script-src *']){
    assert.throws(()=>trustedApiOrigin(url));
  }
});
test('always-on security headers protect frames, MIME and device permissions',()=>{
  const headers=securityHeaders();
  assert.equal(headers['X-Frame-Options'],'DENY');
  assert.equal(headers['X-Content-Type-Options'],'nosniff');
  assert.match(headers['Permissions-Policy'],/camera=\(\)/);
  assert.equal(headers['Referrer-Policy'],'strict-origin-when-cross-origin');
});
test('function middleware preserves body, status, noindex and diagnostics',async()=>{
  const response=await onRequest({env:{},next:async()=>new Response('not found',{status:404,headers:{'X-Robots-Tag':'noindex, nofollow','X-SEO-Source':'live','Content-Type':'text/html'}})});
  assert.equal(response.status,404);
  assert.equal(await response.text(),'not found');
  assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
  assert.equal(response.headers.get('x-seo-source'),'live');
  assert.ok(response.headers.has('content-security-policy-report-only'));
});
test('function middleware enforces only one CSP policy',async()=>{
  const response=await onRequest({env:{VITE_CSP_ENFORCE:'true'},next:async()=>new Response('ok',{headers:{'Content-Security-Policy-Report-Only':"default-src 'self'"}})});
  assert.ok(response.headers.has('content-security-policy'));
  assert.equal(response.headers.has('content-security-policy-report-only'),false);
});
test('invalid runtime origin falls back safely without breaking SEO',async()=>{
  const response=await onRequest({env:{VITE_API_URL:'http://bad.example'},next:async()=>new Response('xml')});
  assert.equal(response.status,200);
  assert.match(response.headers.get('content-security-policy-report-only'),/https:\/\/research-guru-nu.vercel.app/);
});
