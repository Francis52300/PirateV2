/* ================================================================
   SERVICE WORKER — Trésor Pirate PWA
   Stratégie :
   - App shell (HTML, JS, CSS) : Cache First
   - Tuiles de carte (CartoDB/OSM) : Cache First avec fallback réseau
   - APIs externes (fonts, Leaflet, React) : Stale While Revalidate
   ================================================================ */

const CACHE_VERSION    = 'tresor-pirate-v9';
const TILE_CACHE       = 'tresor-tiles-v9';
const ASSETS_CACHE     = 'tresor-assets-v9';

/* Assets à précacher au moment de l'installation */
const PRECACHE_ASSETS = [
  './index.html',
  './manifest.json',
  './images/pirate-map.png',
  './images/pirate-chest-open.png',
  './images/pirate-cry.png',
];

/* Domaines des tuiles de carte */
const TILE_HOSTS = [
  'basemaps.cartocdn.com',
  'tile.openstreetmap.org',
];

/* CDN à mettre en cache à la volée */
const CDN_HOSTS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/* ── Installation ── */
self.addEventListener('install', event => {
  console.log('[SW] Installation v1');
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activation & nettoyage des anciens caches ── */
self.addEventListener('activate', event => {
  console.log('[SW] Activation');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION && k !== TILE_CACHE && k !== ASSETS_CACHE)
          .map(k => { console.log('[SW] Suppression ancien cache:', k); return caches.delete(k); })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Interception des requêtes ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* 1. Tuiles de carte → Cache First, limite à 500 tuiles */
  if (TILE_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(tileStrategy(event.request));
    return;
  }

  /* 2. CDN (Leaflet, React, Babel, fonts) → Cache First avec fallback réseau */
  if (CDN_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(cacheFirstWithNetwork(event.request, ASSETS_CACHE));
    return;
  }

  /* 3. App shell → Cache First */
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstWithNetwork(event.request, CACHE_VERSION));
    return;
  }

  /* 4. Tout le reste → réseau direct */
  event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
});

/* ── Stratégie tuiles : cache LRU 500 entrées ── */
async function tileStrategy(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      /* Limiter la taille du cache tuiles */
      await limitCacheSize(TILE_CACHE, 500);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    /* Offline sans cache → tuile grise transparente */
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#d4c9a8" opacity=".4"/><text x="128" y="132" text-anchor="middle" font-size="20" fill="#7a5c30" font-family="serif">⚓ Hors ligne</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

/* ── Cache First avec fallback réseau ── */
async function cacheFirstWithNetwork(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== 'opaque') {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || new Response('Ressource indisponible hors ligne', { status: 503 });
  }
}

/* ── Limite la taille d'un cache (supprime les plus anciens) ── */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  if (keys.length >= maxItems) {
    /* Supprimer les 50 plus anciens */
    const toDelete = keys.slice(0, 50);
    await Promise.all(toDelete.map(k => cache.delete(k)));
  }
}

/* ── Message depuis l'app (ex: forcer mise à jour) ── */
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
  if (event.data === 'clearTiles') {
    caches.delete(TILE_CACHE).then(() => console.log('[SW] Cache tuiles vidé'));
  }
});
