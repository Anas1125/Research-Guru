
import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/[[path]].js';
const origin = 'https://research-guru.pages.dev';
const env = {ADMIN_PROXY_SECRET:'a'.repeat(40)};
test('proxy rejects missing CSRF and foreign origins',async()=>{
  for(const headers of [{},{Origin:'https://evil.example','X-RG-CSRF':'1'}]){
    const response = await onRequest({env,request:new Request(origin+'/api/auth/session/login',{method:'POST',headers})});
    assert.equal(response.status,403);
  }
});
test('proxy strips attacker supplied trust headers and forwards only session cookie',async t=>{
  t.mock.method(globalThis,'fetch',async(url,opts)=>{
    assert.equal(url,'https://research-guru-nu.vercel.app/api/admin/users');
    assert.equal(opts.headers.get('x-rg-proxy-secret'),env.ADMIN_PROXY_SECRET);
    assert.equal(opts.headers.get('x-rg-client-ip'),'192.0.2.1');
    assert.equal(opts.headers.get('cookie'),'__Host-rg-session=token');
    assert.equal(opts.headers.get('authorization'),null);
    return new Response('[]',{headers:{'Content-Type':'application/json'}});
  });
  const response=await onRequest({env,request:new Request(origin+'/api/admin/users',{headers:{
    'CF-Connecting-IP':'192.0.2.1','X-RG-Proxy-Secret':'fake','X-RG-Client-IP':'fake',
    'Cookie':'other=private; __Host-rg-session=token','Authorization':'Bearer fake'
  }})});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('cache-control'),'no-store');
});
test('proxy refuses unconfigured secret',async()=>{
  assert.equal((await onRequest({env:{},request:new Request(origin+'/api/auth/session/me')})).status,503);
});
