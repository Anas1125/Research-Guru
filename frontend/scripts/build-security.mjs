import { readFile, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { securityHeaders } from '../src/utils/security.js';

const env = loadEnv('production', process.cwd(), 'VITE_');
const headers = securityHeaders(env);
const existing = await readFile('public/_headers', 'utf8');
const securityRules = '/*\n' + Object.entries(headers).map(([key,value]) => '  '+key+': '+value).join('\n')+'\n';
await writeFile('dist/_headers',securityRules+'\n'+existing);
console.log('Security headers generated: '+(env.VITE_CSP_ENFORCE === 'true' ? 'CSP enforced' : 'CSP report-only'));
