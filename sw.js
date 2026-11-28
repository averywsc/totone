/* Totone PWA Offline Service Worker (Stale-While-Revalidate for Core Static Assets) */
const CACHE='totone-app-v7.7.1';
const CORE=[
 './','./index.html','./manifest.json','./og-preview.png',
 './css/core.css?v=4','./css/studio.css?v=4','./css/studio-pro-ui.css?v=18','./css/seo-landing.css',
 './js/seo-landing.js',
 './js/core.js','./js/studio-canva.js','./js/studio-ps.js','./js/studio-ux.js',
 './js/studio-lightroom.js','./js/studio-ai.js','./js/studio-pro.js',
 './js/studio-settings.js','./js/studio-magic.js','./js/studio-power.js',
 './js/studio-overlays.js','./js/studio-lab10.js','./js/studio-polish.js',
 './js/studio-cutout-pro.js','./js/studio-sessions.js','./js/studio-pages.js',
 './js/studio-ultimate.js','./js/studio-nextgen.js','./js/studio-wave6.js',
 './js/studio-wave7.js','./js/studio-crop-pro.js','./js/studio-polaroid.js','./js/studio-stickers.js','./js/studio-creative.js','./js/studio-extend.js'
];

self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);
 if(url.origin!==self.location.origin)return;
 e.respondWith(
  caches.match(e.request).then(cached=>{
   const net=fetch(e.request).then(res=>{
    if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
    return res;
   }).catch(()=>cached);
   return cached||net;
  })
 );
});
