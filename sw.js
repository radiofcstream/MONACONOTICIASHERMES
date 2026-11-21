const CACHE='monaco-radio-v1';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/admin.html','/manifest.webmanifest','/assets/monaco.png']))));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname==='/radio-stream')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)))});
