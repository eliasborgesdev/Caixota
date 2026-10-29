import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('manifest.json'));
assert.equal(manifest.manifest_version,3);
assert.equal(manifest.version,'0.1.0');
assert(manifest.permissions.includes('tabCapture'));
assert(manifest.host_permissions.includes('<all_urls>'));
assert(manifest.content_scripts.some(x=>x.matches?.includes('<all_urls>')));

const csp=manifest.content_security_policy;
assert(!csp.extension_pages.includes('unsafe-eval'),'unsafe-eval must not enter privileged extension pages');
assert(csp.sandbox.includes('sandbox allow-scripts'));
assert(!csp.sandbox.includes('allow-same-origin'));
assert(csp.sandbox.includes("connect-src 'none'"));
assert(csp.sandbox.includes("child-src 'none'"));
const moduleHost=read('assets/module-host.mjs');
assert(moduleHost.includes('event.source!==frame.contentWindow'));
assert(moduleHost.includes('sandbox="allow-scripts"'));
const parser=read('assets/module-package.mjs');
for(const defense of ['MAX_ZIP','MAX_EXPANDED','MAX_FILE','crc32','..','Object.hasOwn(assets,name)'])assert(parser.includes(defense));
assert(read('docs/MODULOS.md').includes('traversal'));

const security=read('docs/REVISAO-SEGURANCA-0.1.0.md');
assert(security.includes('superfície de acesso ampla'));
assert(security.toLowerCase().includes('não equivale a auditoria independente'));
assert(read('LICENSE.md').includes('não uma licença open source aprovada pela OSI'));
assert(read('THIRD-PARTY-NOTICES.md').includes('PDF.js'));

const credentialPattern=/(AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA|OPENSSH|EC|DSA) PRIVATE KEY-----|sk-[A-Za-z0-9]{20,}|client_secret\s*[:=])/;
const scan=(dir)=>{
  for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,item.name),rel=path.relative(root,full).replaceAll(path.sep,'/');
    if(item.isDirectory()){
      if(['.git','node_modules','vendor'].includes(item.name)||rel==='tests')continue;
      scan(full);
    }else if(/\.(?:js|mjs|html|json|css)$/i.test(item.name)){
      const source=fs.readFileSync(full,'utf8');
      assert(!credentialPattern.test(source),`credential-like pattern found in ${rel}`);
    }
  }
};
scan(root);
console.log('PASS: Manifest V3, CSP/sandbox invariants, module ZIP defenses, disclosures, and source credential-pattern scan.');
console.log('NOTE: <all_urls> and tabCapture remain explicit review findings; see docs/REVISAO-SEGURANCA-0.1.0.md.');
