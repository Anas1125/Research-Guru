import test from 'node:test';
import assert from 'node:assert/strict';
import { safeImageUrl, safeOfferLink } from '../src/utils/safeUrls.js';
const api = 'https://research-guru-nu.vercel.app';
test('stored and external image URLs remain usable', () => {
  assert.equal(safeImageUrl('/api/files/blog/a.png', api), api + '/api/files/blog/a.png');
  assert.equal(safeImageUrl('/uploads/site/a.png', api), api + '/uploads/site/a.png');
  assert.equal(safeImageUrl('https://images.example/a.png', api), 'https://images.example/a.png');
  assert.equal(safeImageUrl('/api/files/site/a.png', 'http://127.0.0.1:8000'), 'http://127.0.0.1:8000/api/files/site/a.png');
});
test('untrusted image schemes and CSS delimiters are rejected', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,x', '//evil.example/a.png', 'https://user:pass@evil.example/a.png', 'https://example/a")', '/\\evil.example/a.png', '/api/files/../secret', '/admin/users', 'https://example/a\n.png', 'http://example/a.png', null]) {
    assert.equal(safeImageUrl(value, api), null, String(value));
  }
});
test('offer links accept same-site routes and HTTPS links', () => {
  assert.equal(safeOfferLink('/contact?coupon=TEST'), '/contact?coupon=TEST');
  assert.equal(safeOfferLink('https://example.com/contact'), 'https://example.com/contact');
});
test('unsafe offer links fall back to contact', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,x', '//evil.example', '/\\evil.example', '/a/..//evil.example', 'https://user:pass@evil.example', 'http://evil.example', null]) assert.equal(safeOfferLink(value), '/contact');
});
