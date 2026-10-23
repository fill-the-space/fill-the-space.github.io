/* ---------- Offline-Speicher der Web-App ----------
   Die Startseite kommt immer zuerst aus dem Netz (damit neue Versionen sofort ankommen), ohne Netz aus dem Speicher.
   Alle anderen Dateien (Skripte mit ?v=…, Schriften, three.js, Symbole) kommen aus dem Speicher und werden beim ersten
   Laden dort abgelegt. Neue Versionen haben durch ?v=… eine neue Adresse und werden deshalb neu geladen. */
const SPEICHER="fill-the-space-1";
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil(caches.open(SPEICHER).then(c=>c.addAll(["./","manifest.webmanifest","icons/icon-192.png"]))); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SPEICHER).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const url=new URL(r.url), seite=r.mode==="navigate";
  if(seite){ e.respondWith(fetch(r).then(a=>{ const k=a.clone(); caches.open(SPEICHER).then(c=>c.put("./",k)); return a; }).catch(()=>caches.match("./"))); return; }
  const erlaubt=url.origin===location.origin||/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname);
  if(!erlaubt) return;
  e.respondWith(caches.match(r).then(t=>t||fetch(r).then(a=>{ if(a.ok||a.type==="opaque"){ const k=a.clone(); caches.open(SPEICHER).then(c=>c.put(r,k)); } return a; })));
});
