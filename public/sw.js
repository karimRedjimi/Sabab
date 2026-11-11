// Service worker : l’application reste utilisable hors ligne.
// Pages : réseau d’abord, copie en cache en secours. Fichiers statiques : cache d’abord.
const CACHE = "sabab-v3";
const PAGES = ["/", "/apprendre", "/communaute", "/carnet", "/suivi", "/plus", "/bilan", "/objectif", "/parcours", "/priere", "/programme", "/rythme", "/confidentialite", "/bienvenue", "/binome", "/donnees", "/chemin", "/combat"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PAGES)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/_next/static/media/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res;
    })));
    return;
  }
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html") || url.searchParams.has("_rsc")) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match("/"))));
  }
});
