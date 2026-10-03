import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map(async (x) =>
        x.isDirectory() ? walk(`${dir}/${x.name}`) : `${dir}/${x.name}`
      )
    )
  ).flat();
}
const files = (await walk('dist')).filter((x) => !x.endsWith('/sw.js'));
const hash = createHash('sha256');
for (const f of files) hash.update(await readFile(f));
const version = 'route-' + hash.digest('hex').slice(0, 12);
const urls = files.map((f) => '/' + f.slice(5));
await writeFile(
  'dist/sw.js',
  `const CACHE=${JSON.stringify(version)};const URLS=${JSON.stringify(urls)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(URLS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('route-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;
if(r.mode==='navigate'){e.respondWith(fetch(r).catch(()=>caches.open(CACHE).then(c=>c.match('/index.html'))));return;}
if(URLS.includes(u.pathname))e.respondWith(caches.open(CACHE).then(async c=>(await c.match(u.pathname,{ignoreVary:true}))||fetch(r)));
});
`
);
console.log(
  `Offline precache: ${urls.length} files; ${version}. New versions activate after all existing tabs close.`
);
